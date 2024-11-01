import { logger } from '@extension/logger'
import {
  AIModel,
  type AIModelFeature,
  type AIProvider,
  type AIProviderType
} from '@shared/utils/ai-providers'

import { aiModelDB } from '../lowdb/ai-model-db'
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

  async updateModel(req: Partial<AIModel> & { id: string }) {
    const { id, ...updates } = req
    return await aiModelDB.update(id, updates)
  }

  async updateModels(req: (Partial<AIModel> & { id: string })[]) {
    return await aiModelDB.batchUpdate(req)
  }

  async removeModel(req: { id: string }) {
    await aiModelDB.remove(req.id)
  }

  async fetchRemoteModelNames(req: { provider: AIProvider }) {
    try {
      // TODO: here we need to get the models from the remote API
      const response = await fetch(
        `${req.provider.extraFields.openaiBaseUrl}/models`
      )
      const data = await response.json()
      return data.models.map((model: any) => model.id) as string[]
    } catch (error) {
      logger.error('Failed to fetch remote models:', error)
      return [] as string[]
    }
  }

  async testModel(req: { model: AIModel; features: AIModelFeature[] }) {
    const results: Partial<AIModel> = {}

    for (const feature of req.features) {
      results[feature] = Math.random() > 0.5
    }

    return results
  }
}
