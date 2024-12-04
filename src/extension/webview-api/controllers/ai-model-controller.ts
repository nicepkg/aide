import { ModelProviderFactory } from '@extension/ai/model-providers/helpers/factory'
import { logger } from '@extension/logger'
import {
  AIProviderType,
  type AIModel,
  type AIModelFeature,
  type AIProvider,
  type FeatureModelSettingKey,
  type FeatureModelSettingValue
} from '@shared/entities'

import { aiModelDB } from '../lowdb/ai-model-db'
import { aiProviderDB } from '../lowdb/ai-provider-db'
import { Controller } from '../types'

export class AIModelController extends Controller {
  readonly name = 'aiModel'

  async getModels() {
    return await aiModelDB.getAll()
  }

  async getModelsByProviderOrBaseUrl(req: {
    providerOrBaseUrl: AIProviderType | string
  }) {
    const models = await aiModelDB.getAll()
    return models.filter(
      model => model.providerOrBaseUrl === req.providerOrBaseUrl
    )
  }

  async addModel(req: Omit<AIModel, 'id'>) {
    const all = await aiModelDB.getAll()
    const existingModel = all.find(
      model =>
        model.name === req.name &&
        model.providerOrBaseUrl === req.providerOrBaseUrl
    )

    if (existingModel) return existingModel

    return await aiModelDB.add(req)
  }

  async createOrUpdateModel(req: Partial<AIModel>) {
    return await aiModelDB.createOrUpdate(req)
  }

  async batchCreateOrUpdateModels(req: Partial<AIModel>[]) {
    return await aiModelDB.batchCreateOrUpdate(req)
  }

  async removeModel(req: { id: string }) {
    await aiModelDB.remove(req.id)
  }

  async fetchRemoteModelNames(req: { provider: AIProvider }) {
    try {
      const modelProvider = ModelProviderFactory.createProvider(
        req.provider,
        undefined
      )
      return await modelProvider.getSupportModelNames()
    } catch (error) {
      logger.error('Failed to fetch remote models:', error)
      return [] as string[]
    }
  }

  async testModelFeatures(req: {
    provider: AIProvider
    model: AIModel
    features: AIModelFeature[]
  }) {
    const modelProvider = ModelProviderFactory.createProvider(
      req.provider,
      req.model
    )

    return await modelProvider.testModelFeatures(req.features)
  }

  async getProviderAndModelForFeature(req: {
    key: FeatureModelSettingKey
  }): Promise<{ provider?: AIProvider; model?: AIModel }> {
    const defaultResult = { provider: undefined, model: undefined }
    const setting = await ModelProviderFactory.getModelSettingForFeature(
      req.key,
      false
    )

    if (!setting) {
      return defaultResult
    }

    const provider = (await aiProviderDB.getAll()).find(
      p => p.id === setting.providerId
    )

    if (!provider) {
      return defaultResult
    }

    const model = (await aiModelDB.getAll()).find(
      m =>
        m.name === setting.modelName &&
        m.providerOrBaseUrl ===
          (provider.type === AIProviderType.Custom
            ? provider.extraFields.customBaseUrl
            : provider.type)
    )

    if (!model) {
      return {
        ...defaultResult,
        provider
      }
    }

    return {
      provider,
      model
    }
  }

  async setModelSettingForFeature(req: {
    key: FeatureModelSettingKey
    value: FeatureModelSettingValue
  }) {
    return await ModelProviderFactory.setModelSettingForFeature(
      req.key,
      req.value
    )
  }
}
