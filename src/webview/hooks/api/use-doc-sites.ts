import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'
import { noop } from 'es-toolkit'

export const useDocSites = () =>
  useQuery({
    queryKey: ['realtime', 'docSites'],
    queryFn: ({ signal }) => api.doc.getDocSites({}, noop, signal)
  })
