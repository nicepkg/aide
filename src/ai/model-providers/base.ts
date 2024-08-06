import type { MaybePromise } from '@/types'
import { normalizeLineEndings } from '@/utils'
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
  useHistory?: boolean
  historyMessages?: BaseMessage[]
  signal?: AbortSignal
}

export interface BaseModelProviderCreateStructuredOutputRunnableOptions<
  ZSchema extends z.ZodType<any> = z.ZodType<any>
> {
  useHistory?: boolean
  historyMessages?: BaseMessage[]
  signal?: AbortSignal
  zodSchema: ZSchema
}

export abstract class BaseModelProvider<Model extends BaseChatModel> {
  static sessionIdHistoriesMap: Record<string, InMemoryChatMessageHistory> = {}

  static answerContentToText(content: MessageContent): string {
    if (typeof content === 'string') return normalizeLineEndings(content)

    return normalizeLineEndings(
      content
        .map(c => {
          if (c.type === 'text') return c.text
          return ''
        })
        .join('')
    )
  }

  model?: Model

  abstract createModel(): MaybePromise<Model>

  async getModel(): Promise<Model> {
    if (!this.model) {
      this.model = await this.createModel()
    }

    return this.model
  }

  createPrompt(options?: {
    useHistory?: boolean
  }): MaybePromise<ChatPromptTemplate> {
    const { useHistory = true } = options ?? {}
    const prompt = ChatPromptTemplate.fromMessages(
      [
        useHistory ? new MessagesPlaceholder('history') : '',
        HumanMessagePromptTemplate.fromTemplate('{input}')
      ].filter(Boolean)
    )

    return prompt
  }

  async getHistory(
    sessionId: string,
    appendHistoryMessages?: BaseMessage[]
  ): Promise<InMemoryChatMessageHistory> {
    if (BaseModelProvider.sessionIdHistoriesMap[sessionId] === undefined) {
      const messageHistory = new InMemoryChatMessageHistory()

      if (appendHistoryMessages && appendHistoryMessages.length > 0) {
        await messageHistory.addMessages(appendHistoryMessages)
      }

      BaseModelProvider.sessionIdHistoriesMap[sessionId] = messageHistory
    }

    return BaseModelProvider.sessionIdHistoriesMap[sessionId]!
  }

  createRunnableWithMessageHistory<Chunk extends AIMessageChunk>(
    chain: Runnable<any, Chunk, RunnableConfig>,
    historyMessages: BaseMessage[]
  ) {
    return new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: async sessionId =>
        await this.getHistory(sessionId, historyMessages),
      inputMessagesKey: 'input',
      historyMessagesKey: 'history'
    })
  }

  async createRunnable(options?: BaseModelProviderCreateRunnableOptions) {
    const { useHistory = true, historyMessages, signal } = options ?? {}
    const model = await this.getModel()
    const prompt = await this.createPrompt({ useHistory })
    const chain = prompt.pipe(signal ? model.bind({ signal }) : model)
    return useHistory
      ? await this.createRunnableWithMessageHistory(
          chain,
          historyMessages || []
        )
      : chain
  }

  async createStructuredOutputRunnable<
    ZSchema extends z.ZodType<any> = z.ZodType<any>
  >(options: BaseModelProviderCreateStructuredOutputRunnableOptions<ZSchema>) {
    const { useHistory = true, historyMessages, zodSchema, signal } = options
    const model = await this.getModel()
    const prompt = await this.createPrompt({ useHistory })
    const chain = prompt.pipe(
      model.withStructuredOutput(zodSchema).bind({
        signal
      })
    )

    return useHistory
      ? await this.createRunnableWithMessageHistory(
          chain,
          historyMessages || []
        )
      : chain
  }
}
