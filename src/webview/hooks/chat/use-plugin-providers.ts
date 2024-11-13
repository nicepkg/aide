import { useMemo } from 'react'
import { usePluginRegistry } from '@webview/contexts/plugin-registry-context'

export const usePluginEditorProviders = () => {
  const { pluginRegistry } = usePluginRegistry()
  const merged = useMemo(
    () => pluginRegistry?.providerManagers.editor.mergeAll() || {},
    [pluginRegistry]
  )

  return merged
}

export const usePluginMessageProviders = () => {
  const { pluginRegistry } = usePluginRegistry()
  const merged = useMemo(
    () => pluginRegistry?.providerManagers.message.mergeAll() || {},
    [pluginRegistry]
  )

  return merged
}

export const usePluginFilesSelectorProviders = () => {
  const { pluginRegistry } = usePluginRegistry()
  const merged = useMemo(
    () => pluginRegistry?.providerManagers.filesSelector.mergeAll() || {},
    [pluginRegistry]
  )

  const selectedFiles = merged.getSelectedFiles?.() || []

  return { ...merged, selectedFiles }
}

export const usePluginImagesSelectorProviders = () => {
  const { pluginRegistry } = usePluginRegistry()
  const merged = useMemo(
    () => pluginRegistry?.providerManagers.imagesSelector.mergeAll() || {},
    [pluginRegistry]
  )

  return merged
}

export const usePluginStates = () => {
  const { pluginRegistry } = usePluginRegistry()
  const states = useMemo(
    () => pluginRegistry?.providerManagers.state.getAll() || {},
    [pluginRegistry]
  )

  return states
}
