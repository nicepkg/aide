import { getConfigKey } from '@/config'
import { getContext } from '@/context'
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import { type BaseMessage, type MessageContent } from '@langchain/core/messages'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts'
import { RunnableWithMessageHistory } from '@langchain/core/runnables'
import { ChatOpenAI } from '@langchain/openai'
import * as vscode from 'vscode'

export const sessionIdHistoriesMap: Record<string, InMemoryChatMessageHistory> =
  {}

export const createOpenAIRunnable = async (
  historyMessages: BaseMessage[] = []
) => {
  const isDev = getContext().extensionMode !== vscode.ExtensionMode.Production
  const openaiBaseUrl = await getConfigKey('openaiBaseUrl')
  const openaiKey = await getConfigKey('openaiKey')
  const openaiModel = await getConfigKey('openaiModel')

  const model = new ChatOpenAI({
    apiKey: openaiKey,
    configuration: {
      baseURL: openaiBaseUrl,
      fetch
    },
    model: openaiModel,
    temperature: 0.95, // never use 1.0, some models do not support it
    verbose: isDev
  })

  // some third-party language models are not compatible with the openAI specification,
  // they do not support some parameters, and langchain takes the initiative to add these parameters,
  // resulting in request failure, so here you need to clear these parameters
  model.frequencyPenalty = undefined as any
  model.n = undefined as any
  model.presencePenalty = undefined as any
  model.topP = undefined as any

  const prompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder('history'),
    HumanMessagePromptTemplate.fromTemplate('{input}')
  ])

  const chain = prompt.pipe(model)

  const withMessageHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: async sessionId => {
      if (sessionIdHistoriesMap[sessionId] === undefined) {
        const messageHistory = new InMemoryChatMessageHistory()

        if (historyMessages.length > 0) {
          await messageHistory.addMessages(historyMessages)
        }

        sessionIdHistoriesMap[sessionId] = messageHistory
      }

      return sessionIdHistoriesMap[sessionId]!
    },
    inputMessagesKey: 'input',
    historyMessagesKey: 'history'
  })

  return withMessageHistory
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
