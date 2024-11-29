import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'
import { noop } from 'es-toolkit'

export const useFiles = () =>
  useQuery({
    queryKey: ['realtime', 'files'],
    queryFn: ({ signal }) =>
      api.file.traverseWorkspaceFiles({ filesOrFolders: ['./'] }, noop, signal)
  })
