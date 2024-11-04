import { v4 as uuidv4 } from 'uuid'

import { AIProviderType } from './ai-provider-entity'
import { BaseEntity, type IBaseEntity } from './base-entity'

export interface AIModel extends IBaseEntity {
  // if the provider is a third party OpenAI-like provider, the value is the base URL
  providerOrBaseUrl: AIProviderType | string
  name: string
  imageSupport: AIModelSupport
  audioSupport: AIModelSupport
  toolsCallSupport: AIModelSupport
}

export class AIModelEntity extends BaseEntity<AIModel> implements AIModel {
  id!: string

  providerOrBaseUrl!: AIProviderType | string

  name!: string

  imageSupport!: AIModelSupport

  audioSupport!: AIModelSupport

  toolsCallSupport!: AIModelSupport

  getDefaults(): AIModel {
    return {
      id: uuidv4(),
      providerOrBaseUrl: AIProviderType.OpenAI,
      name: 'unknown',
      imageSupport: 'unknown',
      audioSupport: 'unknown',
      toolsCallSupport: 'unknown'
    }
  }
}

export type AIModelSupport = boolean | 'unknown'

export type AIModelFeature = keyof Pick<
  AIModel,
  'imageSupport' | 'audioSupport' | 'toolsCallSupport'
>

export const aiModelFeatures = [
  'imageSupport',
  'audioSupport',
  'toolsCallSupport'
] as const satisfies AIModelFeature[]
