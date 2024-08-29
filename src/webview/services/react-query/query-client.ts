import { QueryCache, QueryClient } from '@tanstack/react-query'
import { getErrorMsg } from '@webview/utils/common'
import { toast } from 'sonner'

const retryDelay = (attemptIndex: number) =>
  Math.min(1000 * 2 ** attemptIndex, 30000)

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        retryDelay,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity
      },
      mutations: {
        retry: 0,
        retryDelay
      }
    },
    queryCache: new QueryCache({
      onError: (error, { queryKey }) => {
        const whiteListQueryKey = [['xxx']]

        if (
          whiteListQueryKey.some(
            key => JSON.stringify(key) === JSON.stringify(queryKey)
          )
        )
          return

        const errMsg = getErrorMsg(error)
        toast.error(errMsg)
      }
    })
  })
