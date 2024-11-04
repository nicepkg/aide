import { v4 as uuidv4 } from 'uuid'

import { BaseEntity, type IBaseEntity } from './base-entity'

export interface AIProvider extends IBaseEntity {
  name: string
  type: AIProviderType
  order: number
  extraFields: Record<string, string>
  allowRealTimeModels: boolean
  realTimeModels: string[]
  manualModels: string[]
}

export class AIProviderEntity extends BaseEntity<AIProvider> {
  protected getDefaults(data: Partial<AIProvider>): AIProvider {
    const type = data.type || AIProviderType.OpenAI
    return {
      id: uuidv4(),
      name: '',
      type,
      order: -1,
      extraFields: this.getDefaultExtraFields(type),
      allowRealTimeModels: true,
      realTimeModels: [],
      manualModels: []
    }
  }

  private getDefaultExtraFields(type: AIProviderType) {
    const config = aiProviderConfigs[type]
    if (!config) return {}
    return config.fields.reduce(
      (acc, field) => {
        if (field.defaultValue) {
          acc[field.key] = field.defaultValue
        }
        return acc
      },
      {} as Record<string, string>
    )
  }
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
