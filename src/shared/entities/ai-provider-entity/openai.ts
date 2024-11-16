import {
  AIProviderEntity,
  AIProviderType,
  type AIProvider,
  type AIProviderConfig
} from './base'

// Provider specific interfaces with typed extraFields
export interface OpenAIProvider extends AIProvider {
  type: AIProviderType.OpenAI
  extraFields: {
    openaiBaseUrl: string
    openaiApiKey: string
  }
}

// Provider specific entities
export class OpenAIProviderEntity extends AIProviderEntity<OpenAIProvider> {
  type = AIProviderType.OpenAI

  getProviderConfig(): AIProviderConfig {
    return {
      name: 'OpenAI',
      fields: [
        {
          key: 'openaiBaseUrl',
          label: 'OpenAI Base URL',
          required: true,
          disabled: true,
          defaultValue: 'https://api.openai.com/v1'
        },
        {
          key: 'openaiApiKey',
          label: 'OpenAI API Key',
          required: true,
          isSecret: true
        }
      ]
    }
  }
}
