import { deepMergeProviders } from './deep-merge-providers'
import type { PluginId } from './types'

export class ProviderManager<T> {
  protected providers: Map<PluginId, () => T> = new Map()

  register(pluginId: PluginId, provider: () => T): void {
    this.providers.set(pluginId, provider)
  }

  unregister(pluginId: PluginId): void {
    this.providers.delete(pluginId)
  }

  getValues(key: keyof T): T[keyof T][] {
    return Array.from(this.providers.values()).map(provider => provider()[key])
  }

  getAll(): Record<PluginId, Partial<T>> {
    const entries = Array.from(this.providers.entries())
    const results = entries.map(([pluginId, provider]) => {
      const value = provider()
      return [pluginId, value] as [PluginId, T]
    })
    return Object.fromEntries(results) as Record<PluginId, T>
  }

  mergeAll(): Partial<T> {
    const allValues = this.getAll()
    return deepMergeProviders(Object.values(allValues))
  }
}
