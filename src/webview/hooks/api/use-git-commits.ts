import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'

export const useGitCommits = () =>
  useQuery({
    queryKey: ['realtime', 'git-commits'],
    queryFn: () =>
      api.git.getHistoryCommits({
        maxCount: 50
      })
  })
