import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import { AIModelEntity, type AIModel } from '@shared/entities/ai-model-entity'

import { BaseDB } from './base-db'

class AIModelDB extends BaseDB<AIModel> {
  static readonly schemaVersion = 1

  constructor() {
    // Use entity's defaults
    const defaults = new AIModelEntity().getDefaults()

    super(
      path.join(aidePaths.getGlobalLowdbPath(), 'ai-models.json'),
      defaults,
      AIModelDB.schemaVersion
    )
  }
}

export const aiModelDB = new AIModelDB()
