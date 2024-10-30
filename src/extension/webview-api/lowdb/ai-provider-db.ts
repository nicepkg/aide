import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import { AIModelProvider } from '@shared/utils/ai-providers'

import { BaseDB } from './base-db'

class AIProviderDB extends BaseDB<AIModelProvider> {
  constructor() {
    super(path.join(aidePaths.getGlobalLowdbPath(), 'ai-providers.json'))
  }
}

export const aiProviderDB = new AIProviderDB()
