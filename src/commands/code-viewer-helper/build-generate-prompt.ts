import { getConfigKey } from '@/config'
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import * as vscode from 'vscode'

export const buildGeneratePrompt = async ({
  sourceLanguage,
  code
}: {
  sourceLanguage: string
  code: string
}): Promise<BaseLanguageModelInput> => {
  const locale = vscode.env.language
  const codeViewerHelperPrompt = await getConfigKey('codeViewerHelperPrompt')
  const prompt = codeViewerHelperPrompt
    .replace('#{sourceLanguage}', sourceLanguage)
    .replace('#{locale}', locale)
    .replace('#{content}', code)
  return prompt
}
