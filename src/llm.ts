import { getConfigKey } from '@/config'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import * as vscode from 'vscode'

import { t } from './i18n'
import { logger } from './logger'

export const askOpenAIStream = async (prompt: string) => {
  const openaiBaseUrl = await getConfigKey('openaiBaseUrl')
  const openaiKey = await getConfigKey('openaiKey')
  const openaiModel = await getConfigKey('openaiModel')

  const openai = createOpenAI({
    baseURL: openaiBaseUrl,
    apiKey: openaiKey,
    compatibility: 'strict' // strict mode, enable when using the OpenAI API
  })
  const model = openai(openaiModel)
  const result = await streamText({
    model,
    prompt
  })

  return result
}

/**
 * vscode copilot LLM
 * only support 4k token
 * see: https://code.visualstudio.com/api/extension-guides/language-model#choosing-the-appropriate-model
 */
// eslint-disable-next-line unused-imports/no-unused-vars
const askVscodeLLM = async (prompt: string) => {
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor) throw new Error(t('info.noActiveEditor'))

  const [model] = await vscode.lm.selectChatModels({
    vendor: 'copilot',
    family: 'gpt-3.5-turbo'
  })
  let chatResponse: vscode.LanguageModelChatResponse | undefined

  const messages = [vscode.LanguageModelChatMessage.User(prompt)]

  if (!model) throw new Error(t('error.vscodeLLMModelNotFound'))

  try {
    chatResponse = await model.sendRequest(
      messages,
      {},
      new vscode.CancellationTokenSource().token
    )
  } catch (err) {
    logger.warn('askVscodeLLM', err)
    throw err
  }

  return {
    textStream: chatResponse.text
  }
}
