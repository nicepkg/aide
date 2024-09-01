import React, { RefObject, useCallback, useState } from 'react'

import { useCallbackRef } from './use-callback-ref'

interface UseKeyboardNavigationProps {
  itemCount: number
  itemRefs: RefObject<(HTMLElement | null)[]>
  mode?: 'tab' | 'arrow'
  onTab?: (el: HTMLElement | undefined, index: number) => void
  onEnter?: (el: HTMLElement | undefined, index: number) => void
  onCtrlEnter?: (el: HTMLElement | undefined, index: number) => void
  defaultStartIndex?: number
  startIndex?: number
  getVisibleIndex?: (index: number) => number
}

export const useKeyboardNavigation = (props: UseKeyboardNavigationProps) => {
  const {
    itemCount,
    itemRefs,
    mode = 'arrow',
    defaultStartIndex,
    startIndex
  } = props

  const defaultIndex = defaultStartIndex ?? -1
  const [focusedIndex, setFocusedIndex] = useState(startIndex ?? defaultIndex)

  const onCtrlEnter = useCallbackRef(props.onCtrlEnter)
  const onTab = useCallbackRef(props.onTab)
  const onEnter = useCallbackRef(props.onEnter)
  const getVisibleIndex = useCallbackRef(props.getVisibleIndex)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent | React.KeyboardEvent) => {
      const currentEl = itemRefs.current?.[focusedIndex] as
        | HTMLElement
        | undefined

      const isWithCtrlKey = event.metaKey || event.ctrlKey

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
            setFocusedIndex(prev => {
              const nextIndex = Math.min(prev + 1, itemCount - 1)
              return getVisibleIndex?.(nextIndex) ?? nextIndex
            })
          }
          break
        case 'ArrowUp':
          if (mode === 'arrow') {
            event.preventDefault()
            setFocusedIndex(prev => {
              const nextIndex = Math.max(prev - 1, 0)
              return getVisibleIndex?.(nextIndex) ?? nextIndex
            })
          }
          break
        case 'Enter':
          if (focusedIndex !== -1) {
            event.preventDefault()

            if (isWithCtrlKey) {
              onCtrlEnter?.(currentEl, focusedIndex)
            } else {
              onEnter?.(currentEl, focusedIndex)
            }
          }
          break
        default:
          break
      }
    },
    [
      focusedIndex,
      itemCount,
      mode,
      onEnter,
      onCtrlEnter,
      onTab,
      getVisibleIndex
    ]
  )

  return { focusedIndex, setFocusedIndex, handleKeyDown }
}
