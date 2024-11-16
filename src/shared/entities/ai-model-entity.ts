import { v4 as uuidv4 } from 'uuid'

import { AIProviderType } from './ai-provider-entity'
import { BaseEntity, type IBaseEntity } from './base-entity'

export interface AIModel extends IBaseEntity {
  // if the provider is a third party OpenAI-like provider, the value is the base URL
  providerOrBaseUrl: AIProviderType | string
  name: string
  chatSupport: AIModelSupport
  imageInputSupport: AIModelSupport
  imageOutputSupport: AIModelSupport
  audioInputSupport: AIModelSupport
  audioOutputSupport: AIModelSupport
  toolsCallSupport: AIModelSupport
}

export class AIModelEntity extends BaseEntity<AIModel> {
  protected getDefaults(data?: Partial<AIModel>): AIModel {
    return {
      id: uuidv4(),
      providerOrBaseUrl: AIProviderType.OpenAI,
      name: '',
      chatSupport: 'unknown',
      imageInputSupport: 'unknown',
      imageOutputSupport: 'unknown',
      audioInputSupport: 'unknown',
      audioOutputSupport: 'unknown',
      toolsCallSupport: 'unknown',
      ...data
    }
  }
}

export type AIModelSupport = boolean | 'unknown'

export type AIModelFeature = keyof Pick<
  AIModel,
  | 'chatSupport'
  | 'imageInputSupport'
  | 'imageOutputSupport'
  | 'audioInputSupport'
  | 'audioOutputSupport'
  | 'toolsCallSupport'
>

export const aiModelFeatures = [
  'chatSupport',
  'imageInputSupport',
  'imageOutputSupport',
  'audioInputSupport',
  'audioOutputSupport',
  'toolsCallSupport'
] as const satisfies AIModelFeature[]
