import { getConfigKey } from '@/config'

import { AzureOpenAIModelProvider } from './azure-openai'
import { OpenAIModelProvider } from './openai'

export const getCurrentModelProvider = async () => {
  const baseUrl = await getConfigKey('openaiBaseUrl')

  if (baseUrl.includes('api.microsoft.com')) {
    return AzureOpenAIModelProvider
  }

  return OpenAIModelProvider
}

export const getCurrentSessionIdHistoriesMap = async () => {
  const ModelProvider = await getCurrentModelProvider()
  return ModelProvider.sessionIdHistoriesMap
}

export const createCurrentModelRunnable = async () => {
  const ModelProvider = await getCurrentModelProvider()
  const modelProvider = new ModelProvider()
  return modelProvider.createRunnable()
}
