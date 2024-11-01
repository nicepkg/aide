import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import { AIModel } from '@shared/utils/ai-providers'

import { BaseDB } from './base-db'

class AIModelDB extends BaseDB<AIModel> {
  constructor() {
    super(path.join(aidePaths.getGlobalLowdbPath(), 'ai-models.json'))
  }
}

export const aiModelDB = new AIModelDB()
