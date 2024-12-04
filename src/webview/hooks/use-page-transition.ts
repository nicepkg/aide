import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import type { PageTransitionDirection } from '../components/page-transition'

export const usePageTransition = (): PageTransitionDirection => {
  const location = useLocation()
  const [direction, setDirection] = useState<PageTransitionDirection>('forward')
  const prevPathRef = useRef<string>(location.pathname)

  useEffect(() => {
    const handler = () => {
      const prevPath = prevPathRef.current
      const currentPath = location.pathname
      const historyState = window.history.state

      if (!prevPath) {
        setDirection('forward')
      } else {
        const isBack = historyState?.idx < (window as any).history.previousIdx
        setDirection(isBack ? 'backward' : 'forward')
        ;(window as any).history.previousIdx = historyState?.idx
      }

      prevPathRef.current = currentPath
    }

    handler()
  }, [location])

  return direction
}
