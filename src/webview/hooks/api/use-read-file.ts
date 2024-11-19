import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'

export const useReadFile = (filePath: string, encoding?: BufferEncoding) =>
  useQuery({
    queryKey: ['realtime', 'read-file', filePath, encoding],
    queryFn: () => api.file.readFile({ path: filePath, encoding }),
    enabled: !!filePath
  })
