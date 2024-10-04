import {
  createModelProvider,
  getCurrentSessionIdHistoriesMap
} from '@extension/ai/helpers'
import { showContinueMessage } from '@extension/file-utils/show-continue-message'
import { getOriginalFileUri } from '@extension/file-utils/tmp-file/get-original-file-uri'
import { getTmpFileInfo } from '@extension/file-utils/tmp-file/get-tmp-file-info'
import { tmpFileWriter } from '@extension/file-utils/tmp-file/tmp-file-writer'
import { t } from '@extension/i18n'
import { getWorkspaceFolder } from '@extension/utils'
import type { RunnableConfig } from '@langchain/core/runnables'
import * as vscode from 'vscode'

import { BaseCommand } from '../base.command'
import { buildGeneratePrompt } from './build-generate-prompt'

export class ExpertCodeEnhancerCommand extends BaseCommand {
  get commandName(): string {
    return 'aide.expertCodeEnhancer'
  }

  async run(): Promise<void> {
    const workspaceFolder = await getWorkspaceFolder()
    const originalFileUri = getOriginalFileUri()
    const tmpFileInfo = await getTmpFileInfo(originalFileUri)

    // ai
    const modelProvider = await createModelProvider()
    const aiRunnableAbortController = new AbortController()
    const aiRunnable = await modelProvider.createRunnable({
      signal: aiRunnableAbortController.signal
    })
    const sessionId = `expertCodeEnhancer:${tmpFileInfo.tmpFileUri.fsPath}}`
    const aiRunnableConfig: RunnableConfig = {
      configurable: {
        sessionId
      }
    }
    const sessionIdHistoriesMap = await getCurrentSessionIdHistoriesMap()
    const isSessionHistoryExists = !!sessionIdHistoriesMap[sessionId]
    const isContinue = tmpFileInfo.isTmpFileHasContent && isSessionHistoryExists

    const prompt = await buildGeneratePrompt({
      workspaceFolder,
      currentFilePath: originalFileUri.fsPath,
      code: tmpFileInfo.originalFileContent,
      codeIsFromSelection: tmpFileInfo.originalFileContentIsFromSelection,
      abortController: aiRunnableAbortController
    })

    const tmpFileWriterReturns = await tmpFileWriter({
      tmpFileOptions: {
        ext: tmpFileInfo.originalFileExt,
        languageId: tmpFileInfo.originalFileLanguageId
      },
      onCancel() {
        aiRunnableAbortController.abort()
      },
      buildAiStream: async () => {
        if (!isContinue) {
          delete sessionIdHistoriesMap[sessionId]
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
      tmpFileUri: tmpFileWriterReturns?.tmpFileUri,
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
    const sessionIdHistoriesMap = await getCurrentSessionIdHistoriesMap()

    Object.keys(sessionIdHistoriesMap).forEach(sessionId => {
      const path = sessionId.match(/^expertCodeEnhancer:(.*)$/)?.[1]

      if (path && !openDocumentPaths.has(path)) {
        delete sessionIdHistoriesMap[sessionId]
      }
    })
  }
}
