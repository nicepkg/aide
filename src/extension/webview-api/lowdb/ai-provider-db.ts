import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import {
  AIProvider,
  AIProviderType,
  getDefaultAIModel,
  type AIModel
} from '@shared/utils/ai-providers'

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
    .map(name => getDefaultAIModel(name, providerOrBaseUrl))
}

class AIProviderDB extends BaseDB<AIProvider> {
  constructor() {
    super(path.join(aidePaths.getGlobalLowdbPath(), 'ai-providers.json'))
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
    for (const model of newModels) {
      await aiModelDB.add(model)
    }

    return await super.add(item)
  }
}

export const aiProviderDB = new AIProviderDB()
