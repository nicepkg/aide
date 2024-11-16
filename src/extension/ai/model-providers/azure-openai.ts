/* eslint-disable no-useless-escape */
import { AzureChatOpenAI } from '@langchain/openai'
import type { AzureOpenAIProvider } from '@shared/entities/ai-provider-entity'
import { AzureClientOptions, AzureOpenAI } from 'openai'

import { BaseModelProvider } from './helpers/base'

export class AzureOpenAIModelProvider extends BaseModelProvider<AzureChatOpenAI> {
  createAzureOpenaiClient(options?: AzureClientOptions) {
    const { extraFields } = this.aiProvider as AzureOpenAIProvider
    const azureOpenai = new AzureOpenAI({
      baseURL: extraFields.azureOpenaiBasePath,
      apiKey: extraFields.azureOpenaiApiKey,
      apiVersion: extraFields.azureOpenaiApiVersion,
      deployment: extraFields.azureOpenaiApiDeploymentName,
      fetch,
      ...options
    })

    return azureOpenai
  }

  async createLangChainModel() {
    if (!this.aiModel?.name) {
      throw new Error(
        'Model name is required, Please check your AI model settings'
      )
    }

    const { extraFields } = this.aiProvider as AzureOpenAIProvider

    const model = new AzureChatOpenAI({
      azureOpenAIBasePath: extraFields.azureOpenaiBasePath,
      azureOpenAIApiKey: extraFields.azureOpenaiApiKey,
      azureOpenAIApiVersion: extraFields.azureOpenaiApiVersion,
      azureOpenAIApiDeploymentName: extraFields.azureOpenaiApiDeploymentName,
      configuration: {
        fetch
      },
      temperature: 0.95,
      verbose: this.isDev,
      maxRetries: 3
    })

    return model
  }

  async getSupportModelNames() {
    const azureOpenai = this.createAzureOpenaiClient()
    const list = await azureOpenai.models.list()

    return list.data.map(model => model.id)
  }
}
