import { getConfigKey } from '@/config'
import { HumanMessage, type MessageContent } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'

export const askOpenAIStream = async (prompt: string) => {
  const openaiBaseUrl = await getConfigKey('openaiBaseUrl')
  const openaiKey = await getConfigKey('openaiKey')
  const openaiModel = await getConfigKey('openaiModel')

  const model = new ChatOpenAI({
    apiKey: openaiKey,
    configuration: {
      baseURL: openaiBaseUrl
    },
    model: openaiModel
  })

  const resStream = await model.stream([new HumanMessage(prompt)])

  return resStream
}

export const openaiAnswerContentToText = (content: MessageContent): string => {
  if (typeof content === 'string') return content

  return content
    .map(c => {
      if (c.type === 'text') return c.text
      return ''
    })
    .join('')
}

/**
 * vscode copilot LLM
 * only support 4k token
 * see: https://code.visualstudio.com/api/extension-guides/language-model#choosing-the-appropriate-model
 */
// eslint-disable-next-line unused-imports/no-unused-vars
// const askVscodeLLM = async (prompt: string) => {
//   const activeEditor = vscode.window.activeTextEditor
//   if (!activeEditor) throw new Error(t('error.noActiveEditor'))

//   const [model] = await vscode.lm.selectChatModels({
//     vendor: 'copilot',
//     family: 'gpt-3.5-turbo'
//   })
//   let chatResponse: vscode.LanguageModelChatResponse | undefined

//   const messages = [vscode.LanguageModelChatMessage.User(prompt)]

//   if (!model) throw new Error(t('error.vscodeLLMModelNotFound'))

//   try {
//     chatResponse = await model.sendRequest(
//       messages,
//       {},
//       new vscode.CancellationTokenSource().token
//     )
//   } catch (err) {
//     logger.warn('askVscodeLLM', err)
//     throw err
//   }

//   return {
//     textStream: chatResponse.text
//   }
// }
