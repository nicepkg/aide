import {
  createModelProvider,
  getCurrentSessionIdHistoriesMap
} from '@/ai/helpers'
import { getConfigKey, setConfigKey } from '@/config'
import { languageIds } from '@/constants'
import { createTmpFileInfo } from '@/file-utils/create-tmp-file'
import { showContinueMessage } from '@/file-utils/show-continue-message'
import { tmpFileWriter } from '@/file-utils/tmp-file-writer'
import { t } from '@/i18n'
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import type { RunnableConfig } from '@langchain/core/runnables'
import * as vscode from 'vscode'

const buildGeneratePrompt = async ({
  sourceLanguageId,
  targetLanguageId,
  sourceCode
}: {
  sourceLanguageId: string
  targetLanguageId: string
  sourceCode: string
}): Promise<BaseLanguageModelInput> => {
  const locale = vscode.env.language
  const prompt = `
  You are a programming language converter.
  You need to help me convert ${sourceLanguageId} code into ${targetLanguageId} code.
  All third-party API and third-party dependency names do not need to be changed,
  as my purpose is only to understand and read, not to run. Please use ${locale} language to add some additional comments as appropriate.
  Please do not reply with any text other than the code, and do not use markdown syntax.
  Here is the code you need to convert:

  ${sourceCode}
`
  return prompt
}

const getTargetLanguageId = async (originalFileLanguageId: string) => {
  const convertLanguagePairs = await getConfigKey('convertLanguagePairs', {
    targetForSet: vscode.ConfigurationTarget.WorkspaceFolder,
    allowCustomOptionValue: true
  })
  let targetLanguageId = convertLanguagePairs?.[originalFileLanguageId] || ''
  const customLanguageOption = t('info.customLanguage')

  if (!targetLanguageId) {
    targetLanguageId =
      (await vscode.window.showQuickPick(
        [customLanguageOption, ...languageIds],
        {
          placeHolder: t('input.codeConvertTargetLanguage.prompt'),
          canPickMany: false
        }
      )) || ''

    if (!targetLanguageId) throw new Error(t('error.noTargetLanguage'))

    if (targetLanguageId === customLanguageOption) {
      targetLanguageId =
        (await vscode.window.showInputBox({
          prompt: t('info.customLanguage')
        })) || ''
    }

    if (!targetLanguageId) throw new Error(t('error.noTargetLanguage'))

    const autoRememberConvertLanguagePairs = await getConfigKey(
      'autoRememberConvertLanguagePairs'
    )

    if (autoRememberConvertLanguagePairs) {
      await setConfigKey(
        'convertLanguagePairs',
        {
          ...convertLanguagePairs,
          [originalFileLanguageId]: targetLanguageId
        },
        {
          targetForSet: vscode.ConfigurationTarget.WorkspaceFolder,
          allowCustomOptionValue: true
        }
      )
    }
  }

  return targetLanguageId
}

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

  const targetLanguageId = await getTargetLanguageId(originalFileLanguageId)
  const modelProvider = await createModelProvider()
  const aiRunnable = await modelProvider.createRunnable()
  const sessionId = `codeConvert:${tmpFileUri.fsPath}}`
  const aiRunnableConfig: RunnableConfig = {
    configurable: {
      sessionId
    }
  }

  const sessionIdHistoriesMap = await getCurrentSessionIdHistoriesMap()
  const isSessionHistoryExists = !!sessionIdHistoriesMap[sessionId]
  const isContinue = isTmpFileHasContent && isSessionHistoryExists

  const prompt = await buildGeneratePrompt({
    sourceLanguageId: originalFileLanguageId,
    targetLanguageId,
    sourceCode: originalFileContent
  })

  const tmpFileWriterReturns = await tmpFileWriter({
    languageId: targetLanguageId,
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
