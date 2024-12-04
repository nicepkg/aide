import { normalizeLineEndings } from '@extension/utils'
import { aiModelDB } from '@extension/webview-api/lowdb/ai-model-db'
import { aiProviderDB } from '@extension/webview-api/lowdb/ai-provider-db'
import { globalSettingsDB } from '@extension/webview-api/lowdb/settings-db'
import type { MessageContent } from '@langchain/core/messages'
import type { AIModel } from '@shared/entities/ai-model-entity'
import {
  AIProvider,
  AIProviderType,
  FeatureModelSettingKey,
  FeatureModelSettingValue
} from '@shared/entities/ai-provider-entity'

import { AnthropicModelProvider } from '../anthropic'
import { AzureOpenAIModelProvider } from '../azure-openai'
import { OpenAIModelProvider } from '../openai'

export class ModelProviderFactory {
  static async create(setting: FeatureModelSettingValue) {
    const { providerId, modelName } = setting

    // Get provider and model from DB
    const provider = (await aiProviderDB.getAll()).find(
      p => p.id === providerId
    )
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`)
    }

    const model = (await aiModelDB.getAll()).find(
      m =>
        m.name === modelName &&
        m.providerOrBaseUrl ===
          (provider.type === AIProviderType.Custom
            ? provider.extraFields.customBaseUrl
            : provider.type)
    )

    if (!modelName) {
      throw new Error(
        'Model name is required, Please check your AI model settings'
      )
    }

    if (!model) {
      throw new Error(`Model not found: ${modelName}`)
    }

    // Create appropriate provider instance
    return ModelProviderFactory.createProvider(provider, model)
  }

  static createProvider(provider: AIProvider, model?: AIModel) {
    switch (provider.type) {
      case AIProviderType.OpenAI:
        return new OpenAIModelProvider(provider, model)
      case AIProviderType.AzureOpenAI:
        return new AzureOpenAIModelProvider(provider, model)
      case AIProviderType.Anthropic:
        return new AnthropicModelProvider(provider, model)
      case AIProviderType.Custom:
        return new OpenAIModelProvider(provider, model) // Custom providers use OpenAI compatible API
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`)
    }
  }

  static formatMessageContent(content: MessageContent): string {
    if (typeof content === 'string') return normalizeLineEndings(content)

    return normalizeLineEndings(
      content
        .map(c => {
          if (c.type === 'text') return c.text
          return ''
        })
        .join('')
    )
  }

  static async getModelProvider(key: FeatureModelSettingKey) {
    const setting = await this.getModelSettingForFeature(key)

    if (!setting) {
      throw new Error(
        'You forgot to set provider or model in your settings, please check your settings.'
      )
    }

    return await this.create(setting)
  }

  static async getModelSettingForFeature(
    key: FeatureModelSettingKey,
    useDefault = true
  ) {
    const settings: Record<
      FeatureModelSettingKey,
      FeatureModelSettingValue
    > | null = await globalSettingsDB.getSetting('models')

    const setting =
      settings?.[key] ||
      (useDefault ? settings?.[FeatureModelSettingKey.Default] : undefined)

    return setting
  }

  static async setModelSettingForFeature(
    key: FeatureModelSettingKey,
    value: FeatureModelSettingValue
  ) {
    const oldSettings: Record<
      FeatureModelSettingKey,
      FeatureModelSettingValue
    > | null = await globalSettingsDB.getSetting('models')

    await globalSettingsDB.setSetting('models', {
      ...oldSettings,
      [key]: value
    })
  }
}
