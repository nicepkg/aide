import {
  AIProviderEntity,
  AIProviderType,
  type AIProvider,
  type AIProviderConfig
} from './base'

export interface AnthropicProvider extends AIProvider {
  type: AIProviderType.Anthropic
  extraFields: {
    anthropicApiUrl: string
    anthropicApiKey: string
  }
}

export class AnthropicProviderEntity extends AIProviderEntity<AnthropicProvider> {
  type = AIProviderType.Anthropic

  getProviderConfig(): AIProviderConfig {
    return {
      name: 'Anthropic',
      fields: [
        {
          key: 'anthropicApiUrl',
          label: 'Anthropic Base URL',
          required: true,
          disabled: true,
          defaultValue: 'https://api.anthropic.com'
        },
        {
          key: 'anthropicApiKey',
          label: 'Anthropic API Key',
          required: true,
          isSecret: true
        }
      ]
    }
  }
}
