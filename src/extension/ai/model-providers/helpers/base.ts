import { getIsDev } from '@extension/utils'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { BaseMessage, type AIMessageChunk } from '@langchain/core/messages'
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
import type { AIModel, AIModelFeature } from '@shared/entities/ai-model-entity'
import type { AIProvider } from '@shared/entities/ai-provider-entity'
import type { MaybePromise } from '@shared/types/common'
import { z } from 'zod'

import { ChatHistoryManager } from './chat-history-manager'
import { FeatureTester } from './feature-tester'

export interface CreateRunnableOptions {
  useHistory?: boolean
  historyMessages?: BaseMessage[]
  signal?: AbortSignal
}

export interface CreateStructuredOutputOptions<
  Schema extends z.ZodType = z.ZodType
> {
  useHistory?: boolean
  historyMessages?: BaseMessage[]
  signal?: AbortSignal
  schema: Schema
}

export abstract class BaseModelProvider<LangChainModel extends BaseChatModel> {
  private langChainModel?: LangChainModel

  protected featureTester?: FeatureTester

  constructor(
    protected aiProvider: AIProvider,
    protected aiModel?: AIModel
  ) {}

  get isDev() {
    return getIsDev()
  }

  abstract createLangChainModel(): MaybePromise<LangChainModel>
  abstract getSupportModelNames(): MaybePromise<string[]>

  testChatSupport(): MaybePromise<boolean | undefined> {
    return undefined
  }

  testToolsCallSupport(): MaybePromise<boolean | undefined> {
    return undefined
  }

  testImageInputSupport(): MaybePromise<boolean | undefined> {
    return undefined
  }

  testImageOutputSupport(): MaybePromise<boolean | undefined> {
    return undefined
  }

  testAudioInputSupport(): MaybePromise<boolean | undefined> {
    return undefined
  }

  testAudioOutputSupport(): MaybePromise<boolean | undefined> {
    return undefined
  }

  async testModelFeatures(
    features: AIModelFeature[]
  ): Promise<Partial<AIModel>> {
    this.featureTester = new FeatureTester(this)
    return this.featureTester.testModelFeatures(features)
  }

  async getLangChainModel(): Promise<LangChainModel> {
    if (!this.langChainModel) {
      this.langChainModel = await this.createLangChainModel()
    }

    return this.langChainModel
  }

  createPromptTemplate(options?: {
    useHistory?: boolean
  }): MaybePromise<ChatPromptTemplate> {
    const { useHistory = true } = options ?? {}
    const promptTemplate = ChatPromptTemplate.fromMessages(
      [
        useHistory ? new MessagesPlaceholder('history') : '',
        HumanMessagePromptTemplate.fromTemplate('{input}')
      ].filter(Boolean)
    )

    return promptTemplate
  }

  createRunnableWithHistory<Chunk extends AIMessageChunk>(
    chain: Runnable<any, Chunk, RunnableConfig>,
    initialMessages: BaseMessage[]
  ) {
    return new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: async sessionId =>
        await ChatHistoryManager.getChatHistory(sessionId, initialMessages),
      inputMessagesKey: 'input',
      historyMessagesKey: 'history'
    })
  }

  async createRunnable(options?: CreateRunnableOptions) {
    const { useHistory = true, historyMessages, signal } = options ?? {}
    const model = await this.getLangChainModel()
    const promptTemplate = await this.createPromptTemplate({ useHistory })
    const chain = promptTemplate.pipe(signal ? model.bind({ signal }) : model)

    return useHistory
      ? await this.createRunnableWithHistory(chain, historyMessages || [])
      : chain
  }

  async createStructuredOutputRunnable<Schema extends z.ZodType>(
    options: CreateStructuredOutputOptions<Schema>
  ) {
    const { useHistory = true, historyMessages, schema, signal } = options
    const model = await this.getLangChainModel()
    const promptTemplate = await this.createPromptTemplate({ useHistory })
    const chain = promptTemplate.pipe(
      model.withStructuredOutput(schema).bind({
        signal
      })
    )

    return useHistory
      ? await this.createRunnableWithHistory(chain, historyMessages || [])
      : chain
  }
}
