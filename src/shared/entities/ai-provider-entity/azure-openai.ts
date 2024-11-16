import {
  AIProviderEntity,
  AIProviderType,
  type AIProvider,
  type AIProviderConfig
} from './base'

export interface AzureOpenAIProvider extends AIProvider {
  type: AIProviderType.AzureOpenAI
  extraFields: {
    azureOpenaiBasePath: string
    azureOpenaiApiKey: string
    azureOpenaiApiVersion: string
    azureOpenaiApiDeploymentName: string
  }
}

export class AzureOpenAIProviderEntity extends AIProviderEntity<AzureOpenAIProvider> {
  type = AIProviderType.AzureOpenAI

  getProviderConfig(): AIProviderConfig {
    return {
      name: 'Azure OpenAI',
      fields: [
        {
          key: 'azureOpenaiBasePath',
          label: 'Azure OpenAI Base Path',
          required: true
        },
        {
          key: 'azureOpenaiApiKey',
          label: 'Azure OpenAI API Key',
          required: true,
          isSecret: true
        },
        {
          key: 'azureOpenaiApiVersion',
          label: 'Azure OpenAI API Version',
          required: true
        },
        {
          key: 'azureOpenaiApiDeploymentName',
          label: 'Azure OpenAI Deployment Name',
          required: true
        }
      ]
    }
  }
}
