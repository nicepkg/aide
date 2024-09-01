import React, { RefObject, useCallback, useState } from 'react'

import { useCallbackRef } from './use-callback-ref'

interface UseKeyboardNavigationProps {
  itemCount: number
  itemRefs: RefObject<(HTMLElement | null)[]>
  mode?: 'tab' | 'arrow'
  onTab?: (el: HTMLElement | undefined, index: number) => void
  onEnter?: (el: HTMLElement | undefined, index: number) => void
  onSpace?: (el: HTMLElement | undefined, index: number) => void
  defaultStartIndex?: number
  startIndex?: number
}

export const useKeyboardNavigation = (props: UseKeyboardNavigationProps) => {
  const { itemCount, itemRefs, mode = 'arrow', defaultStartIndex } = props

  const defaultIndex = defaultStartIndex ?? -1
  const [focusedIndex, setFocusedIndex] = useState(defaultIndex)

  const onSpace = useCallbackRef(props.onSpace)
  const onTab = useCallbackRef(props.onTab)
  const onEnter = useCallbackRef(props.onEnter)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent | React.KeyboardEvent) => {
      const currentEl = itemRefs.current?.[focusedIndex] as
        | HTMLElement
        | undefined

      switch (event.key) {
        case 'Tab':
          if (mode === 'tab') {
            event.preventDefault()
            const newIndex = (focusedIndex + 1) % itemCount
            setFocusedIndex(newIndex)
            onTab?.(itemRefs.current?.[newIndex] as HTMLElement, newIndex)
          }
          break

        case 'ArrowDown':
          if (mode === 'arrow') {
            event.preventDefault()
            setFocusedIndex(prev => Math.min(prev + 1, itemCount - 1))
          }
          break
        case 'ArrowUp':
          if (mode === 'arrow') {
            event.preventDefault()
            setFocusedIndex(prev => Math.max(prev - 1, 0))
          }
          break
        case 'Enter':
          if (focusedIndex !== -1) {
            event.preventDefault()
            onEnter?.(currentEl, focusedIndex)
          }
          break
        case ' ':
          if (focusedIndex !== -1 && onSpace) {
            event.preventDefault()
            onSpace?.(currentEl, focusedIndex)
          }
          break
        default:
          break
      }
    },
    [focusedIndex, itemCount, mode, onEnter, onSpace, onTab]
  )

  return { focusedIndex, setFocusedIndex, handleKeyDown }
}
