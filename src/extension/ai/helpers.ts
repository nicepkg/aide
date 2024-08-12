import type { BaseChatModel } from '@langchain/core/language_models/chat_models'

import { AzureOpenAIModelProvider } from './model-providers/azure-openai'
import type { BaseModelProvider } from './model-providers/base'
import { AnthropicModelProvider } from './model-providers/claude'
import { OpenAIModelProvider } from './model-providers/openai'
import { parseModelBaseUrl, type ModelUrlType } from './parse-model-base-url'

export const getCurrentModelProvider = async () => {
  const { urlType } = await parseModelBaseUrl()

  const urlTypeProviderMap = {
    openai: OpenAIModelProvider,
    'azure-openai': AzureOpenAIModelProvider,
    anthropic: AnthropicModelProvider
  } satisfies Record<ModelUrlType, typeof BaseModelProvider<BaseChatModel>>

  return urlTypeProviderMap[urlType] || OpenAIModelProvider
}

export const getCurrentSessionIdHistoriesMap = async () => {
  const ModelProvider = await getCurrentModelProvider()
  return ModelProvider.sessionIdHistoriesMap
}

export const createModelProvider = async () => {
  const ModelProvider = await getCurrentModelProvider()
  const modelProvider = new ModelProvider()
  return modelProvider
}
