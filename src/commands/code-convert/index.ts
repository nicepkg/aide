import {
  createModelProvider,
  getCurrentSessionIdHistoriesMap
} from '@/ai/helpers'
import { createTmpFileInfo } from '@/file-utils/create-tmp-file'
import { showContinueMessage } from '@/file-utils/show-continue-message'
import { tmpFileWriter } from '@/file-utils/tmp-file-writer'
import { t } from '@/i18n'
import type { RunnableConfig } from '@langchain/core/runnables'
import * as vscode from 'vscode'

import { buildConvertPrompt } from './build-convert-prompt'
import { getTargetLanguageInfo } from './get-target-language-info'

export const cleanupCodeConvertRunnables = async () => {
  const openDocumentPaths = new Set(
    vscode.workspace.textDocuments.map(doc => doc.uri.fsPath)
  )

  const sessionIdHistoriesMap = await getCurrentSessionIdHistoriesMap()

  Object.keys(sessionIdHistoriesMap).forEach(sessionId => {
    const path = sessionId.match(/^codeConvert:(.*)$/)?.[1]

    if (path && !openDocumentPaths.has(path)) {
      delete sessionIdHistoriesMap[sessionId]
    }
  })
}

export const handleCodeConvert = async () => {
  const {
    originalFileContent,
    originalFileLanguageId,
    tmpFileUri,
    isTmpFileHasContent
  } = await createTmpFileInfo()

  const { targetLanguageId, targetLanguageExt, targetLanguageDescription } =
    await getTargetLanguageInfo(originalFileLanguageId)

  // ai
  const modelProvider = await createModelProvider()
  const aiRunnableAbortController = new AbortController()
  const aiRunnable = await modelProvider.createRunnable({
    signal: aiRunnableAbortController.signal
  })
  const sessionId = `codeConvert:${tmpFileUri.fsPath}}`
  const aiRunnableConfig: RunnableConfig = {
    configurable: {
      sessionId
    }
  }

  const sessionIdHistoriesMap = await getCurrentSessionIdHistoriesMap()
  const isSessionHistoryExists = !!sessionIdHistoriesMap[sessionId]
  const isContinue = isTmpFileHasContent && isSessionHistoryExists

  const prompt = await buildConvertPrompt({
    sourceLanguageId: originalFileLanguageId,
    targetLanguageId,
    targetLanguageDescription,
    sourceCode: originalFileContent
  })

  const tmpFileWriterReturns = await tmpFileWriter({
    languageId: targetLanguageId,
    ext: targetLanguageExt,
    onCancel() {
      aiRunnableAbortController.abort()
    },
    buildAiStream: async () => {
      if (!isContinue) {
        // cleanup previous session
        delete sessionIdHistoriesMap[sessionId]

        const aiStream = aiRunnable.stream(
          {
            input: prompt
          },
          aiRunnableConfig
        )
        return aiStream
      }

      // continue
      return aiRunnable.stream(
        {
          input: `
        continue, please do not reply with any text other than the code, and do not use markdown syntax.
        go continue.
        `
        },
        aiRunnableConfig
      )
    }
  })

  await showContinueMessage({
    tmpFileUri: tmpFileWriterReturns.tmpFileUri,
    originalFileContentLineCount: originalFileContent.split('\n').length,
    continueMessage: t('info.continueMessage') + t('info.iconContinueMessage'),
    onContinue: async () => {
      await handleCodeConvert()
    }
  })
}
