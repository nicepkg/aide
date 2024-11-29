import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'
import { noop } from 'es-toolkit'

export const useGetFullPath = ({
  path,
  returnNullIfNotExists
}: {
  path: string
  returnNullIfNotExists?: boolean
}) =>
  useQuery({
    queryKey: ['realtime', 'get-full-path', path],
    queryFn: ({ signal }) =>
      api.file.getFullPath({ path, returnNullIfNotExists }, noop, signal),
    enabled: !!path
  })
