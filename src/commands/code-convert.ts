import { getConfigKey, setConfigKey } from '@/config'
import { languageIds } from '@/constants'
import { createTempFileAndWriter } from '@/create-tmp-file'
import { t } from '@/i18n'
import { askOpenAIStream } from '@/llm'
import * as vscode from 'vscode'

const askAiForCode = async ({
  sourceLanguage,
  targetLanguage,
  code
}: {
  sourceLanguage: string
  targetLanguage: string
  code: string
}) => {
  const locale = vscode.env.language
  const prompt = `
  You are a programming language converter.
  You need to help me convert ${sourceLanguage} code into ${targetLanguage} code.
  All third-party API and third-party dependency names do not need to be changed,
  as my purpose is only to understand and read, not to run. Please use ${locale} language to add some additional comments as appropriate.
  Please do not reply with any text other than the code, and do not use markdown syntax.
  Here is the code you need to convert:

  ${code}
`
  return askOpenAIStream(prompt)
}

export const handleCodeConvert = async () => {
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor) {
    vscode.window.showInformationMessage(t('info.noActiveEditor'))
    return
  }

  const content = activeEditor.document.getText()

  const convertLanguagePairs = await getConfigKey('convertLanguagePairs', {
    targetForSet: vscode.ConfigurationTarget.WorkspaceFolder,
    allowCustomOptionValue: true
  })

  const currentLanguage = activeEditor.document.languageId
  let targetLanguage = convertLanguagePairs?.[currentLanguage] || ''

  if (!targetLanguage) {
    targetLanguage =
      (await vscode.window.showQuickPick(languageIds, {
        placeHolder: t('input.codeConvertTargetLanguage.prompt'),
        canPickMany: false
      })) || ''

    if (!targetLanguage) return

    await setConfigKey(
      'convertLanguagePairs',
      {
        ...convertLanguagePairs,
        [currentLanguage]: targetLanguage
      },
      {
        targetForSet: vscode.ConfigurationTarget.WorkspaceFolder,
        allowCustomOptionValue: true
      }
    )
  }

  const languageId = languageIds.includes(targetLanguage)
    ? targetLanguage
    : 'plaintext'

  const { writeTextPart } = await createTempFileAndWriter({
    languageId
  })

  const result = await askAiForCode({
    sourceLanguage: currentLanguage,
    targetLanguage,
    code: content
  })

  for await (const textPart of result.textStream) {
    await writeTextPart(textPart)
  }
}
