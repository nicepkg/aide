import type { MaybePromise } from '@/types'
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import {
  BaseMessage,
  MessageContent,
  type AIMessageChunk
} from '@langchain/core/messages'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts'
import {
  RunnableWithMessageHistory,
  type Runnable,
  type RunnableConfig
} from '@langchain/core/runnables'

export interface BaseModelProviderCreateRunnableOptions {
  historyMessages: BaseMessage[]
}

export abstract class BaseModelProvider<Model extends BaseChatModel> {
  static sessionIdHistoriesMap: Record<string, InMemoryChatMessageHistory> = {}

  static answerContentToText(content: MessageContent): string {
    if (typeof content === 'string') return content

    return content
      .map(c => {
        if (c.type === 'text') return c.text
        return ''
      })
      .join('')
  }

  abstract createModel(): MaybePromise<Model>

  createPrompt(): MaybePromise<ChatPromptTemplate> {
    const prompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}')
    ])

    return prompt
  }

  createChain(
    prompt: ChatPromptTemplate,
    model: Model
  ): MaybePromise<Runnable<any, AIMessageChunk, RunnableConfig>> {
    const chain = prompt.pipe(model)
    return chain
  }

  createRunnableWithMessageHistory(
    chain: Runnable<any, AIMessageChunk, RunnableConfig>,
    historyMessages: BaseMessage[]
  ) {
    return new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: async sessionId => {
        if (BaseModelProvider.sessionIdHistoriesMap[sessionId] === undefined) {
          const messageHistory = new InMemoryChatMessageHistory()

          if (historyMessages.length > 0) {
            await messageHistory.addMessages(historyMessages)
          }

          BaseModelProvider.sessionIdHistoriesMap[sessionId] = messageHistory
        }

        return BaseModelProvider.sessionIdHistoriesMap[sessionId]!
      },
      inputMessagesKey: 'input',
      historyMessagesKey: 'history'
    })
  }

  async createRunnable(options?: BaseModelProviderCreateRunnableOptions) {
    const { historyMessages } = options ?? {}
    const model = await this.createModel()
    const prompt = await this.createPrompt()
    const chain = await this.createChain(prompt, model)
    return await this.createRunnableWithMessageHistory(
      chain,
      historyMessages || []
    )
  }
}
