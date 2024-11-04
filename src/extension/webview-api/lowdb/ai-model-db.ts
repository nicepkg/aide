import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import { AIModelEntity, type AIModel } from '@shared/entities/ai-model-entity'

import { BaseDB } from './base-db'

class AIModelDB extends BaseDB<AIModel> {
  static readonly schemaVersion = 1

  constructor() {
    const defaults = new AIModelEntity().entity

    super(
      path.join(aidePaths.getGlobalLowdbPath(), 'ai-models.json'),
      defaults,
      AIModelDB.schemaVersion
    )
  }
}

export const aiModelDB = new AIModelDB()
