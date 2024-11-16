import { ChatHistoryManager } from '@extension/ai/model-providers/helpers/chat-history-manager'
import { ModelProviderFactory } from '@extension/ai/model-providers/helpers/factory'
import { showContinueMessage } from '@extension/file-utils/show-continue-message'
import { getOriginalFileUri } from '@extension/file-utils/tmp-file/get-original-file-uri'
import { getTmpFileInfo } from '@extension/file-utils/tmp-file/get-tmp-file-info'
import { tmpFileWriter } from '@extension/file-utils/tmp-file/tmp-file-writer'
import { t } from '@extension/i18n'
import type { RunnableConfig } from '@langchain/core/runnables'
import { FeatureModelSettingKey } from '@shared/entities'
import * as vscode from 'vscode'

import { BaseCommand } from '../base.command'
import { buildConvertPrompt } from './build-convert-prompt'
import { getTargetLanguageInfo } from './get-target-language-info'

export class CodeConvertCommand extends BaseCommand {
  get commandName(): string {
    return 'aide.codeConvert'
  }

  async run(): Promise<void> {
    const originalFileUri = getOriginalFileUri()
    const tmpFileInfo = await getTmpFileInfo(originalFileUri)

    const { targetLanguageId, targetLanguageExt, targetLanguageDescription } =
      await getTargetLanguageInfo(tmpFileInfo.originalFileLanguageId)

    // ai
    const modelProvider = await ModelProviderFactory.getModelProvider(
      FeatureModelSettingKey.CodeConvert
    )
    const aiRunnableAbortController = new AbortController()
    const aiRunnable = await modelProvider.createRunnable({
      signal: aiRunnableAbortController.signal
    })
    const sessionId = `codeConvert:${tmpFileInfo.tmpFileUri.fsPath}}`
    const aiRunnableConfig: RunnableConfig = {
      configurable: {
        sessionId
      }
    }

    const isChatExists = await ChatHistoryManager.isChatExist(sessionId)
    const isContinue = tmpFileInfo.isTmpFileHasContent && isChatExists

    const prompt = await buildConvertPrompt({
      sourceLanguageId: tmpFileInfo.originalFileLanguageId,
      targetLanguageId,
      targetLanguageDescription,
      sourceCode: tmpFileInfo.originalFileContent
    })

    const tmpFileWriterReturns = await tmpFileWriter({
      tmpFileOptions: {
        languageId: targetLanguageId,
        ext: targetLanguageExt
      },
      onCancel() {
        aiRunnableAbortController.abort()
      },
      buildAiStream: async () => {
        if (!isContinue) {
          await ChatHistoryManager.clearChatHistory(sessionId)
          return aiRunnable.stream({ input: prompt }, aiRunnableConfig)
        }

        return aiRunnable.stream(
          {
            input:
              'continue, please do not reply with any text other than the code, and do not use markdown syntax. go continue.'
          },
          aiRunnableConfig
        )
      }
    })

    await showContinueMessage({
      tmpFileUri: tmpFileWriterReturns.tmpFileUri,
      originalFileContentLineCount:
        tmpFileInfo.originalFileContent.split('\n').length,
      continueMessage:
        t('info.continueMessage') + t('info.iconContinueMessage'),
      onContinue: async () => {
        await this.run()
      }
    })
  }

  async dispose(): Promise<void> {
    const openDocumentPaths = new Set(
      vscode.workspace.textDocuments.map(doc => doc.uri.fsPath)
    )

    const chatHistories = ChatHistoryManager.getChatHistories()
    Object.keys(chatHistories).forEach(sessionId => {
      const path = sessionId.match(/^codeConvert:(.*)$/)?.[1]

      if (path && !openDocumentPaths.has(path)) {
        ChatHistoryManager.deleteChatHistory(sessionId)
      }
    })
  }
}
