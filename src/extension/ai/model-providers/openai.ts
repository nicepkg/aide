import {
  ChatOpenAI,
  type ChatOpenAICallOptions,
  type ClientOptions
} from '@langchain/openai'
import type { OpenAIProvider } from '@shared/entities/ai-provider-entity'
import OpenAI from 'openai'

import { BaseModelProvider } from './helpers/base'

export class OpenAIModelProvider extends BaseModelProvider<
  ChatOpenAI<ChatOpenAICallOptions>
> {
  createOpenaiClient(options?: ClientOptions) {
    const { extraFields } = this.aiProvider as OpenAIProvider
    const openai = new OpenAI({
      baseURL: extraFields.openaiBaseUrl,
      apiKey: extraFields.openaiApiKey,
      fetch,
      ...options
    })

    return openai
  }

  async createLangChainModel() {
    if (!this.aiModel?.name) {
      throw new Error(
        'Model name is required, Please check your AI model settings'
      )
    }

    const { extraFields } = this.aiProvider as OpenAIProvider

    const model = new ChatOpenAI({
      apiKey: extraFields.openaiApiKey,
      configuration: {
        baseURL: extraFields.openaiBaseUrl,
        fetch
      },
      modelName: this.aiModel.name,
      temperature: 0.95,
      maxRetries: 3,
      verbose: this.isDev
    })

    // Clear incompatible parameters for third-party models
    model.frequencyPenalty = undefined as any
    model.n = undefined as any
    model.presencePenalty = undefined as any
    model.topP = undefined as any

    return model
  }

  async getSupportModelNames() {
    const openai = this.createOpenaiClient()
    const list = await openai.models.list()

    return list.data.map(model => model.id)
  }
}
