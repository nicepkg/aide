import { ChatContextType } from '../chat-context-entity'
import { AnthropicProviderEntity } from './anthropic'
import { AzureOpenAIProviderEntity } from './azure-openai'
import {
  AIProviderEntity,
  AIProviderType,
  type AIProvider,
  type AIProviderConfig
} from './base'
import { CustomProviderEntity } from './custom'
import { OpenAIProviderEntity } from './openai'

export * from './base'
export * from './anthropic'
export * from './azure-openai'
export * from './custom'
export * from './openai'

// Factory function to create the correct entity based on provider type
export function createAIProviderEntity(type: AIProviderType) {
  switch (type) {
    case AIProviderType.OpenAI:
      return new OpenAIProviderEntity()
    case AIProviderType.AzureOpenAI:
      return new AzureOpenAIProviderEntity()
    case AIProviderType.Anthropic:
      return new AnthropicProviderEntity()
    case AIProviderType.Custom:
      return new CustomProviderEntity()
    default:
      throw new Error(`Unknown provider type: ${type}`)
  }
}

export const getAllAIProviderConfigMap = (): Record<
  AIProviderType,
  AIProviderConfig
> => {
  const Entities = [
    OpenAIProviderEntity,
    AzureOpenAIProviderEntity,
    AnthropicProviderEntity,
    CustomProviderEntity
  ]

  return Entities.reduce(
    (acc, Entity) => {
      const entity = new Entity()
      acc[entity.type] = entity.getProviderConfig()
      return acc
    },
    {} as Record<AIProviderType, AIProviderConfig>
  )
}

export class UnknownAIProviderEntity extends AIProviderEntity<AIProvider> {
  type = AIProviderType.Unknown

  getProviderConfig(): AIProviderConfig {
    return {
      name: '',
      fields: []
    }
  }
}

export enum FeatureModelSettingKey {
  Default = 'default',
  Chat = 'chat',
  Composer = 'composer',
  AutoTask = 'autoTask',
  UIDesigner = 'uiDesigner',
  Completion = 'completion',
  ApplyFile = 'applyFile',
  BatchProcessor = 'batchProcessor',
  CodeConvert = 'codeConvert',
  CodeViewerHelper = 'codeViewerHelper',
  ExpertCodeEnhancer = 'expertCodeEnhancer',
  RenameVariable = 'renameVariable',
  SmartPaste = 'smartPaste'
}

export interface FeatureModelSettingValue {
  providerId: string
  modelName: string
}

export const chatContextTypeModelSettingKeyMap: Record<
  ChatContextType,
  FeatureModelSettingKey
> = {
  [ChatContextType.Chat]: FeatureModelSettingKey.Chat,
  [ChatContextType.Composer]: FeatureModelSettingKey.Composer,
  [ChatContextType.UIDesigner]: FeatureModelSettingKey.UIDesigner,
  [ChatContextType.AutoTask]: FeatureModelSettingKey.AutoTask
}