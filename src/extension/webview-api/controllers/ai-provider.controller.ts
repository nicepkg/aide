import { AIProvider } from '@shared/utils/ai-providers'

import { aiProviderDB } from '../lowdb/ai-provider-db'
import { Controller } from '../types'

export class AIProviderController extends Controller {
  readonly name = 'aiProvider'

  async getProviders() {
    const providers = await aiProviderDB.getAll()
    return providers.sort((a, b) => b.order - a.order)
  }

  async addProvider(req: Omit<AIProvider, 'id'>) {
    return await aiProviderDB.add(req)
  }

  async updateProvider(req: Partial<AIProvider> & { id: string }) {
    const { id, ...updates } = req
    return await aiProviderDB.update(id, updates)
  }

  async updateProviders(req: Partial<AIProvider> & { id: string }[]) {
    return await aiProviderDB.batchUpdate(req)
  }

  async removeProvider(req: { id: string }) {
    await aiProviderDB.remove(req.id)
  }
}
