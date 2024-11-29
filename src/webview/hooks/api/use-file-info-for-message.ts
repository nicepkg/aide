import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'
import { noop } from 'es-toolkit'

export const useFileInfoForMessage = (params: {
  relativePath: string | undefined
  startLine?: number | undefined
  endLine?: number | undefined
}) =>
  useQuery({
    queryKey: ['fileInfoForMessage', JSON.stringify(params)],
    queryFn: ({ signal }) =>
      api.file.getFileInfoForMessage(
        {
          ...params,
          relativePath: params.relativePath!
        },
        noop,
        signal
      ),
    enabled: !!params.relativePath
  })
