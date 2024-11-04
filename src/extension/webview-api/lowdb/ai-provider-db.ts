import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import { AIModelEntity, type AIModel } from '@shared/entities/ai-model-entity'
import {
  AIProviderEntity,
  AIProviderType,
  type AIProvider
} from '@shared/entities/ai-provider-entity'

import { aiModelDB } from './ai-model-db'
import { BaseDB } from './base-db'

const findNewModel = async (
  modelsName: string[],
  providerOrBaseUrl: string
): Promise<Omit<AIModel, 'id'>[]> => {
  const allModels = await aiModelDB.getAll()

  // Create a Set for O(1) lookup
  const existingModelSet = new Set(
    allModels
      .filter(model => model.providerOrBaseUrl === providerOrBaseUrl)
      .map(model => model.name)
  )

  // Filter out models that don't exist yet
  return modelsName
    .filter(name => !existingModelSet.has(name))
    .map(
      name =>
        new AIModelEntity({
          name,
          providerOrBaseUrl
        }).entity
    )
}

class AIProviderDB extends BaseDB<AIProvider> {
  static readonly schemaVersion = 1

  constructor() {
    const defaults = new AIProviderEntity().entity

    super(
      path.join(aidePaths.getGlobalLowdbPath(), 'ai-providers.json'),
      defaults,
      AIProviderDB.schemaVersion
    )
  }

  async add(
    item: Omit<AIProvider, 'id'> & { id?: string | undefined }
  ): Promise<AIProvider> {
    const providerOrBaseUrl =
      item.type === AIProviderType.Custom
        ? item.extraFields.customBaseUrl
        : item.type

    // Handle the case where providerOrBaseUrl might be undefined
    if (!providerOrBaseUrl) {
      throw new Error('Provider or base URL is required')
    }

    const newModels = await findNewModel(
      [...item.manualModels, ...item.realTimeModels],
      providerOrBaseUrl
    )

    // Add models one by one to avoid type error
    await aiModelDB.batchAdd(newModels)

    return await super.add(item)
  }
}

export const aiProviderDB = new AIProviderDB()
