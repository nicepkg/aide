import { v4 as uuidv4 } from 'uuid'

export type AIModelSupport = boolean | 'unknown'
export interface AIModel {
  id: string
  // if the provider is a third party OpenAI-like provider, the value is the base URL
  providerOrBaseUrl: AIProviderType | string
  name: string
  imageSupport: AIModelSupport
  audioSupport: AIModelSupport
  toolsCallSupport: AIModelSupport
}

export const getDefaultAIModel = (
  name: string,
  providerOrBaseUrl: AIProviderType | string
) =>
  ({
    id: uuidv4(),
    providerOrBaseUrl,
    name,
    imageSupport: 'unknown',
    audioSupport: 'unknown',
    toolsCallSupport: 'unknown'
  }) satisfies AIModel

export type AIModelFeature = keyof Pick<
  AIModel,
  'imageSupport' | 'audioSupport' | 'toolsCallSupport'
>

export const aiModelFeatures = [
  'imageSupport',
  'audioSupport',
  'toolsCallSupport'
] as const satisfies AIModelFeature[]

export interface AIProvider {
  id: string
  name: string
  type: AIProviderType
  order: number
  extraFields: Record<string, string>
  allowRealTimeModels: boolean
  realTimeModels: string[]
  manualModels: string[]
}

export enum AIProviderType {
  OpenAI = 'openai',
  AzureOpenAI = 'azure-openai',
  Anthropic = 'anthropic',
  Custom = 'custom'
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

export const aiProviderConfigs: Record<AIProviderType, AIProviderConfig> = {
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
  },
  [AIProviderType.Custom]: {
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
