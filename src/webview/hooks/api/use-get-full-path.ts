import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'

export const useGetFullPath = ({
  path,
  returnNullIfNotExists
}: {
  path: string
  returnNullIfNotExists?: boolean
}) =>
  useQuery({
    queryKey: ['realtime', 'get-full-path', path],
    queryFn: () => api.file.getFullPath({ path, returnNullIfNotExists }),
    enabled: !!path
  })
