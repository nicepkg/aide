import { Fragment, useMemo, type FC } from 'react'
import type { ConversationLog } from '@shared/entities'
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

export const usePluginCustomRenderLogPreview = () => {
  const { pluginRegistry } = usePluginRegistry()
  const renders = pluginRegistry?.providerManagers.message.getValues(
    'customRenderLogPreview'
  )

  const customRenderLogPreview: FC<{ log: ConversationLog }> = ({ log }) =>
    renders?.map((render, i) => <Fragment key={i}>{render({ log })}</Fragment>)

  return customRenderLogPreview
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
