import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'

export const useFolders = () =>
  useQuery({
    queryKey: ['folders'],
    queryFn: () => api.file.traverseWorkspaceFolders({ folders: ['./'] })
  })
