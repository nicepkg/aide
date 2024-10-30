export interface AIModelProvider {
  id: string
  name: string
  type: AIProviderType
  extraFields: Record<string, string>
  order: number
}

export enum AIProviderType {
  OpenAI = 'openai',
  AzureOpenAI = 'azure-openai',
  Anthropic = 'anthropic'
}

interface AIProviderConfig {
  name: string
  fields: {
    key: string
    label: string
    defaultValue?: string
    disabled?: boolean
    required: boolean
    isSecret?: boolean
  }[]
}

export const AI_PROVIDER_CONFIGS: Record<AIProviderType, AIProviderConfig> = {
  [AIProviderType.OpenAI]: {
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
  },
  [AIProviderType.AzureOpenAI]: {
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
  },
  [AIProviderType.Anthropic]: {
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
