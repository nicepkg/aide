import { useMemo } from 'react'
import { usePluginRegistry } from '@webview/contexts/plugin-registry-context'

export const usePluginEditorProviders = () => {
  const { pluginRegistry, isPluginRegistryLoaded } = usePluginRegistry()
  const merged = useMemo(
    () => pluginRegistry?.providerManagers.editor.mergeAll() || {},
    [isPluginRegistryLoaded]
  )

  return merged
}

export const usePluginFilesSelectorProviders = () => {
  const { pluginRegistry, isPluginRegistryLoaded } = usePluginRegistry()
  const merged = useMemo(
    () => pluginRegistry?.providerManagers.filesSelector.mergeAll() || {},
    [isPluginRegistryLoaded]
  )

  return merged
}

export const usePluginImagesSelectorProviders = () => {
  const { pluginRegistry, isPluginRegistryLoaded } = usePluginRegistry()
  const merged = useMemo(
    () => pluginRegistry?.providerManagers.imagesSelector.mergeAll() || {},
    [isPluginRegistryLoaded]
  )

  return merged
}

export const usePluginStates = () => {
  const { pluginRegistry, isPluginRegistryLoaded } = usePluginRegistry()
  const states = useMemo(
    () => pluginRegistry?.providerManagers.state.getAll() || {},
    [isPluginRegistryLoaded]
  )

  return states
}
