import {
  AIProviderEntity,
  AIProviderType,
  type AIProvider,
  type AIProviderConfig
} from './base'

export interface CustomProvider extends AIProvider {
  type: AIProviderType.Custom
  extraFields: {
    customBaseUrl: string
    customApiKey: string
  }
}
export class CustomProviderEntity extends AIProviderEntity<CustomProvider> {
  type = AIProviderType.Custom

  getProviderConfig(): AIProviderConfig {
    return {
      name: 'Custom',
      fields: [
        {
          key: 'customBaseUrl',
          label: 'Custom Third-Party Base URL',
          required: true
        },
        {
          key: 'customApiKey',
          label: 'Custom Third-Party API Key',
          required: true,
          isSecret: true
        }
      ]
    }
  }
}
