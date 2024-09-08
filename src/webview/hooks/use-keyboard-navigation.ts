import React, { RefObject, useCallback, useState } from 'react'

import { useCallbackRef } from './use-callback-ref'

interface UseKeyboardNavigationProps {
  itemCount: number
  itemRefs: RefObject<(HTMLElement | null)[]>
  listRef?: RefObject<HTMLElement>
  mode?: 'tab' | 'arrow'
  onTab?: (el: HTMLElement | undefined, index: number) => void
  onEnter?: (el: HTMLElement | undefined, index: number) => void
  onCtrlEnter?: (el: HTMLElement | undefined, index: number) => void
  defaultStartIndex?: number
  startIndex?: number
  getVisibleIndex?: (index: number) => number
  loop?: boolean
}

export const useKeyboardNavigation = (props: UseKeyboardNavigationProps) => {
  const {
    itemCount,
    itemRefs,
    listRef,
    mode = 'arrow',
    defaultStartIndex,
    startIndex,
    loop = true
  } = props

  const defaultIndex = defaultStartIndex ?? -1
  const [focusedIndex, setFocusedIndex] = useState(startIndex ?? defaultIndex)

  const onCtrlEnter = useCallbackRef(props.onCtrlEnter)
  const onTab = useCallbackRef(props.onTab)
  const onEnter = useCallbackRef(props.onEnter)
  const getVisibleIndex = useCallbackRef(props.getVisibleIndex)

  const getNextIndex = useCallback(
    (currentIndex: number, step: number): number => {
      let nextIndex = currentIndex + step
      if (loop) {
        nextIndex = (nextIndex + itemCount) % itemCount
      } else {
        nextIndex = Math.max(0, Math.min(nextIndex, itemCount - 1))
      }
      return getVisibleIndex?.(nextIndex) ?? nextIndex
    },
    [itemCount, loop, getVisibleIndex]
  )

  const scrollIntoView = useCallback(
    (index: number, direction: 'up' | 'down') => {
      if (!listRef?.current || !itemRefs.current?.[index]) return

      const list = listRef.current
      const item = itemRefs.current[index]

      if (!item) return

      const listRect = list.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()

      if (direction === 'down') {
        if (itemRect.bottom > listRect.bottom) {
          list.scrollTop += itemRect.bottom - listRect.bottom
        } else if (index === 0 && loop) {
          // If looping to the first item from the last, scroll to top
          list.scrollTop = 0
        }
      } else if (direction === 'up') {
        if (itemRect.top < listRect.top) {
          list.scrollTop -= listRect.top - itemRect.top
        } else if (index === itemCount - 1 && loop) {
          // If looping to the last item from the first, scroll to bottom
          list.scrollTop = list.scrollHeight - list.clientHeight
        }
      }
    },
    [listRef, itemRefs, itemCount, loop]
  )

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
            event.stopPropagation()
            const newIndex = getNextIndex(focusedIndex, 1)
            setFocusedIndex(newIndex)
            onTab?.(itemRefs.current?.[newIndex] as HTMLElement, newIndex)
            scrollIntoView(newIndex, 'down')
          }
          break

        case 'ArrowDown':
          if (mode === 'arrow') {
            event.preventDefault()
            event.stopPropagation()
            setFocusedIndex(prev => {
              const newIndex = getNextIndex(prev, 1)
              scrollIntoView(newIndex, 'down')
              return newIndex
            })
          }
          break
        case 'ArrowUp':
          if (mode === 'arrow') {
            event.preventDefault()
            event.stopPropagation()
            setFocusedIndex(prev => {
              const newIndex = getNextIndex(prev, -1)
              scrollIntoView(newIndex, 'up')
              return newIndex
            })
          }
          break
        case 'Enter':
          if (focusedIndex !== -1) {
            event.preventDefault()
            event.stopPropagation()

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
      getVisibleIndex,
      getNextIndex,
      scrollIntoView
    ]
  )

  return { focusedIndex, setFocusedIndex, handleKeyDown }
}
