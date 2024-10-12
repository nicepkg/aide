import { useQuery } from '@tanstack/react-query'
import { usePluginRegistry } from '@webview/contexts/plugin-registry-context'

export const useMentionOptions = () => {
  const { pluginRegistry, isPluginRegistryLoaded } = usePluginRegistry()

  const { data: mentionOptions = [] } = useQuery({
    queryKey: ['realtime', 'useMentionOptions', isPluginRegistryLoaded],
    queryFn: async () => {
      const editorProvider = pluginRegistry?.providerManagers.editor.mergeAll()
      const result = (await editorProvider?.getMentionOptions?.()) || []

      return result
    },
    enabled: isPluginRegistryLoaded
  })

  return mentionOptions
}
