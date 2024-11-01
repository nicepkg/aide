import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import { AIProvider } from '@shared/utils/ai-providers'

import { BaseDB } from './base-db'

class AIProviderDB extends BaseDB<AIProvider> {
  constructor() {
    super(path.join(aidePaths.getGlobalLowdbPath(), 'ai-providers.json'))
  }
}

export const aiProviderDB = new AIProviderDB()
