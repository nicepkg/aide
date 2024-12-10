import { deepMergeProviders } from './deep-merge-providers'
import { PluginId } from './types'

export class ProviderUtils {
  static getValues = <T>(idProvidersMap: Record<PluginId, () => T>): T[] =>
    Object.values(idProvidersMap).map(provider => provider?.())

  static mergeAll = <T>(
    idProvidersMap: Record<PluginId, () => T>
  ): T | undefined => {
    const allValues = ProviderUtils.getValues(idProvidersMap)
    return deepMergeProviders(allValues)
  }
}

export class ProviderManager<T> {
  protected idProvidersMap = {} as Record<PluginId, () => T>

  register(pluginId: PluginId, provider: () => T): void {
    this.idProvidersMap[pluginId] = provider
  }

  unregister(pluginId: PluginId): void {
    delete this.idProvidersMap[pluginId]
  }

  getValues(): T[] {
    return ProviderUtils.getValues<T>(this.idProvidersMap)
  }

  mergeAll(): T | undefined {
    return ProviderUtils.mergeAll<T>(this.idProvidersMap)
  }
}
