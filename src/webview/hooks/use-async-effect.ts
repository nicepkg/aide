import { useCallback, useEffect, useRef, useState } from 'react'
import { logger } from '@webview/utils/logger'

export const useAsyncEffect = <T>(
  mountCallback: () => Promise<T>,
  unmountCallback: () => Promise<void>,
  deps: any[] = []
): UseAsyncEffectResult<T> => {
  const isMounted = useRef(false)
  const [state, setState] = useState<UseAsyncEffectState<T>>({
    isLoading: true,
    error: undefined,
    result: undefined
  })

  const setStateIfMounted = useCallback(
    (newState: Partial<UseAsyncEffectState<T>>) => {
      if (isMounted.current) {
        setState(prev => ({ ...prev, ...newState }))
      }
    },
    []
  )

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    let cleanup: (() => void) | undefined

    const execute = async () => {
      setStateIfMounted({ isLoading: true, error: undefined })
      try {
        const result = await mountCallback()
        setStateIfMounted({ result, isLoading: false })
        if (typeof result === 'function') {
          cleanup = result as () => void
        }
      } catch (error) {
        setStateIfMounted({ error, isLoading: false })
      }
    }

    execute()

    return () => {
      if (cleanup) {
        cleanup()
      }
      unmountCallback().catch(error => {
        logger.error('Error in unmount callback:', error)
      })
    }
  }, deps)

  return state
}

interface UseAsyncEffectState<T> {
  result: T | undefined
  error: unknown
  isLoading: boolean
}

export type UseAsyncEffectResult<T> = UseAsyncEffectState<T>
