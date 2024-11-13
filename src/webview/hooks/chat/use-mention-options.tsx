import { useQuery } from '@tanstack/react-query'
import { usePluginRegistry } from '@webview/contexts/plugin-registry-context'

export const useMentionOptions = () => {
  const { pluginRegistry } = usePluginRegistry()

  const { data: mentionOptions = [] } = useQuery({
    queryKey: ['realtime', 'useMentionOptions', pluginRegistry],
    queryFn: async () => {
      const editorProvider = pluginRegistry?.providerManagers.editor.mergeAll()
      const result = (await editorProvider?.getMentionOptions?.()) || []

      return result
    },
    enabled: !!pluginRegistry
  })

  return mentionOptions
}
