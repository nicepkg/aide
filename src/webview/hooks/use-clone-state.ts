import { useEffect, useRef, useState } from 'react'
import { isEqual } from 'es-toolkit'
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
    if (!isEqual(state, prevStateRef.current)) {
      const [, patches] = produceWithPatches(prevStateRef.current, draft => {
        Object.assign(draft, state)
      })

      if (patches.length > 0) {
        setCloneState(current => applyPatches(current, patches))
      }

      prevStateRef.current = state
    }
  }, [state])

  const updateCloneState: Updater<T> = updater => {
    if (typeof updater === 'function') {
      setCloneState(current => produce(current, updater as DraftFunction<T>))
    } else {
      setCloneState(updater)
    }
  }

  const applyClone = () => {
    if (!isEqual(state, cloneState)) {
      setState(cloneState)
    }
  }

  return [cloneState, updateCloneState, applyClone] as const
}
