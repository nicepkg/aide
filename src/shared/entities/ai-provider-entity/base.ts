import { v4 as uuidv4 } from 'uuid'

import { BaseEntity, type IBaseEntity } from '../base-entity'

// Base interfaces
export interface AIProvider extends IBaseEntity {
  name: string
  type: AIProviderType
  order: number
  extraFields: Record<string, string>
  allowRealTimeModels: boolean
  realTimeModels: string[]
  manualModels: string[]
}

export enum AIProviderType {
  Unknown = 'unknown',
  OpenAI = 'openai',
  AzureOpenAI = 'azure-openai',
  Anthropic = 'anthropic',
  Custom = 'custom'
}

export interface AIProviderConfig {
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

export abstract class AIProviderEntity<
  T extends AIProvider
> extends BaseEntity<T> {
  abstract type: AIProviderType
  abstract getProviderConfig(): AIProviderConfig

  protected getDefaults(data?: Partial<T>): T {
    const type = data?.type ?? this.type
    return {
      id: uuidv4(),
      name: '',
      type,
      order: -1,
      extraFields: this.getDefaultExtraFields(),
      allowRealTimeModels: true,
      realTimeModels: [],
      manualModels: [],
      ...data
    } as unknown as T
  }

  protected getDefaultExtraFields(): Record<string, string> {
    const config = this.getProviderConfig()
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
