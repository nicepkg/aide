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
import { z } from 'zod'

export interface BaseModelProviderCreateRunnableOptions {
  historyMessages?: BaseMessage[]
}

export interface BaseModelProviderCreateStructuredOutputRunnableOptions<
  ZSchema extends z.ZodType<any>
> {
  historyMessages?: BaseMessage[]
  zodSchema: ZSchema
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

  createRunnableWithMessageHistory<Chunk extends AIMessageChunk>(
    chain: Runnable<any, Chunk, RunnableConfig>,
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
    const chain = prompt.pipe(model)
    return await this.createRunnableWithMessageHistory(
      chain,
      historyMessages || []
    )
  }

  async createStructuredOutputRunnable<ZSchema extends z.ZodType<any>>(
    options: BaseModelProviderCreateStructuredOutputRunnableOptions<ZSchema>
  ) {
    const { historyMessages, zodSchema } = options
    const model = await this.createModel()
    const prompt = await this.createPrompt()
    const chain = prompt.pipe(model.withStructuredOutput(zodSchema))

    return await this.createRunnableWithMessageHistory(
      chain,
      historyMessages || []
    )
  }
}
