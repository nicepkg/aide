import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'

export const useFiles = () =>
  useQuery({
    queryKey: ['realtime', 'files'],
    queryFn: () => api.file.traverseWorkspaceFiles({ filesOrFolders: ['./'] })
  })