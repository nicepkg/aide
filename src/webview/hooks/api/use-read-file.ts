import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'

export const useReadFile = (filePath: string) =>
  useQuery({
    queryKey: ['realtime', 'read-file', filePath],
    queryFn: () => api.file.readFile({ path: filePath }),
    enabled: !!filePath
  })
