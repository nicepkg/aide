import { useRef } from 'react'
import { useEvent } from 'react-use'
import type {
  ListenerType1,
  ListenerType2,
  UseEventOptions,
  UseEventTarget
} from 'react-use/lib/useEvent'

import { useElementInView } from './use-element-in-view'

declare type AddEventListener<T> = T extends ListenerType1
  ? T['addEventListener']
  : T extends ListenerType2
    ? T['on']
    : never
export const useEventInView = <T extends UseEventTarget>(
  name: Parameters<AddEventListener<T>>[0],
  handler?: Parameters<AddEventListener<T>>[1] | null | undefined,
  target?: Window | T | null,
  options?: UseEventOptions<T> | undefined
) => {
  const containerRef = useRef<any | null>(null)
  const { inView } = useElementInView({ ref: containerRef })

  useEvent(
    name,
    event => {
      if (inView) {
        handler?.(event)
      }
    },
    target,
    options
  )

  return containerRef
}
