import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'

export const useDocSites = () =>
  useQuery({
    queryKey: ['realtime', 'docSites'],
    queryFn: () => api.doc.getDocSites({})
  })
