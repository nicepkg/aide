import { DependencyList, useEffect, useRef, useState } from 'react'

type AsyncState<T> = {
  loading: boolean
  error: Error | null
  result: T | null
}

export const useAsyncMemo = <T>(
  asyncFactory: () => Promise<T>,
  deps: DependencyList
): [T | null, boolean, Error | null] => {
  const [state, setState] = useState<AsyncState<T>>({
    loading: true,
    error: null,
    result: null
  })

  const lastDeps = useRef<DependencyList | null>(null)
  const isActiveRef = useRef<boolean>(true)

  useEffect(() => {
    isActiveRef.current = true

    const depsChanged =
      !lastDeps.current ||
      !deps.every((dep, i) => Object.is(dep, lastDeps.current![i]))

    if (depsChanged) {
      setState({ loading: true, error: null, result: null })

      asyncFactory()
        .then(result => {
          if (isActiveRef.current) {
            setState({ loading: false, error: null, result })
          }
        })
        .catch(error => {
          if (isActiveRef.current) {
            setState({ loading: false, error, result: null })
          }
        })

      lastDeps.current = deps
    }

    return () => {
      isActiveRef.current = false
    }
  }, deps)

  return [state.result, state.loading, state.error]
}
