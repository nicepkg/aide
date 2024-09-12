import { useEffect, useRef, useState } from 'react'
import { applyPatches, enablePatches, produce, produceWithPatches } from 'immer'
import type { DraftFunction, Updater } from 'use-immer'

enablePatches()

export const useCloneState = <T extends object>(
  state: T,
  setState: Updater<T>
) => {
  const [cloneState, setCloneState] = useState<T>(() =>
    JSON.parse(JSON.stringify(state))
  )
  const prevStateRef = useRef(state)

  useEffect(() => {
    if (state !== prevStateRef.current) {
      const [, patches] = produceWithPatches(prevStateRef.current, draft => {
        Object.assign(draft, state)
      })

      setCloneState(current => applyPatches(current, patches))
      prevStateRef.current = state
    }
  }, [state])

  const updateCloneState: Updater<T> = updater => {
    setCloneState(current => produce(current, updater as DraftFunction<T>))
  }

  const applyClone = () => {
    setState(cloneState)
  }

  return [cloneState, updateCloneState, applyClone] as const
}
