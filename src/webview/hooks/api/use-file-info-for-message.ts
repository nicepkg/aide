import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'

export const useFileInfoForMessage = (params: {
  relativePath: string | undefined
  startLine?: number | undefined
  endLine?: number | undefined
}) =>
  useQuery({
    queryKey: ['fileInfoForMessage', JSON.stringify(params)],
    queryFn: () =>
      api.file.getFileInfoForMessage({
        ...params,
        relativePath: params.relativePath!
      }),
    enabled: !!params.relativePath
  })
