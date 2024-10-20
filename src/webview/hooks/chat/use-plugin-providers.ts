import { useMemo } from 'react'
import { usePluginRegistry } from '@webview/contexts/plugin-registry-context'

export const usePluginEditorProviders = () => {
  const { pluginRegistryRef, isPluginRegistryLoaded } = usePluginRegistry()
  const merged = useMemo(
    () => pluginRegistryRef.current?.providerManagers.editor.mergeAll() || {},
    [isPluginRegistryLoaded]
  )

  return merged
}

export const usePluginFilesSelectorProviders = () => {
  const { pluginRegistryRef, isPluginRegistryLoaded } = usePluginRegistry()
  const merged = useMemo(
    () =>
      pluginRegistryRef.current?.providerManagers.filesSelector.mergeAll() ||
      {},
    [isPluginRegistryLoaded]
  )

  const selectedFiles = merged.getSelectedFiles?.() || []

  return { ...merged, selectedFiles }
}

export const usePluginImagesSelectorProviders = () => {
  const { pluginRegistryRef, isPluginRegistryLoaded } = usePluginRegistry()
  const merged = useMemo(
    () =>
      pluginRegistryRef.current?.providerManagers.imagesSelector.mergeAll() ||
      {},
    [isPluginRegistryLoaded]
  )

  return merged
}

export const usePluginStates = () => {
  const { pluginRegistryRef, isPluginRegistryLoaded } = usePluginRegistry()
  const states = useMemo(
    () => pluginRegistryRef.current?.providerManagers.state.getAll() || {},
    [isPluginRegistryLoaded]
  )

  return states
}
