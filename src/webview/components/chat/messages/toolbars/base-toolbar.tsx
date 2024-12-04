import { useEffect, useState, type FC } from 'react'
import { useCallbackRef } from '@webview/hooks/use-callback-ref'
import { cn } from '@webview/utils/common'
import { throttle } from 'es-toolkit'

export interface BaseToolbarProps {
  messageRef: React.RefObject<HTMLElement | null>
  scrollContentRef: React.RefObject<HTMLElement | null>
  className?: string
  bottomOffset?: number
  buildChildren: (props: { isFloating: boolean }) => React.ReactNode
}

export const BaseToolbar: FC<BaseToolbarProps> = ({
  messageRef,
  scrollContentRef,
  className,
  bottomOffset = 16,
  buildChildren
}) => {
  const [isFloating, setIsFloating] = useState(false)
  const [floatingPosition, setFloatingPosition] = useState({
    bottom: 0,
    left: 0
  })

  const checkShouldFloat = useCallbackRef(() => {
    if (!messageRef.current || !scrollContentRef.current) return

    const messageRect = messageRef.current.getBoundingClientRect()
    const containerRect = scrollContentRef.current.getBoundingClientRect()

    if (messageRect.height === 0 || containerRect.height === 0) return

    const isPartiallyOutBottom = messageRect.bottom > containerRect.bottom
    const isTopVisible = messageRect.top < containerRect.bottom

    const shouldFloat = isPartiallyOutBottom && isTopVisible

    setIsFloating(shouldFloat)

    if (shouldFloat) {
      const bottom = window.innerHeight - containerRect.bottom + bottomOffset
      const left = containerRect.left + containerRect.width / 2

      setFloatingPosition({ bottom, left })
    }
  })

  useEffect(() => {
    const scrollContainer = scrollContentRef.current
    const throttledCheckShouldFloat = throttle(checkShouldFloat, 100, {
      edges: ['leading', 'trailing']
    })

    // // Create mutation observer to watch for DOM changes
    const mutationObserver = new MutationObserver(mutations => {
      // Check if the mutations affect visibility or size
      const shouldCheck = mutations.some(
        mutation =>
          mutation.type === 'attributes' ||
          mutation.type === 'childList' ||
          (mutation.target instanceof Element &&
            (mutation.target.clientHeight > 0 ||
              mutation.target.clientWidth > 0))
      )

      if (shouldCheck) {
        throttledCheckShouldFloat()
      }
    })

    if (scrollContainer) {
      mutationObserver.observe(scrollContainer, {
        attributes: true,
        childList: true,
        subtree: true
      })
    }

    window.addEventListener('resize', throttledCheckShouldFloat)
    scrollContainer?.addEventListener('scroll', throttledCheckShouldFloat)

    throttledCheckShouldFloat()

    return () => {
      window.removeEventListener('resize', throttledCheckShouldFloat)
      scrollContainer?.removeEventListener('scroll', throttledCheckShouldFloat)
      mutationObserver.disconnect()
      throttledCheckShouldFloat.cancel()
    }
  }, [checkShouldFloat])

  const toolbarContent = (
    <div className={cn('relative flex z-10 border rounded-lg', className)}>
      {buildChildren({ isFloating })}
    </div>
  )

  return (
    <>
      {/* Static version - always rendered */}
      <div className="mt-2 mb-4">{toolbarContent}</div>

      {/* Fixed version - rendered when floating */}
      {isFloating && (
        <div
          style={{
            position: 'fixed',
            bottom: floatingPosition.bottom,
            left: floatingPosition.left,
            transform: 'translateX(-50%)'
          }}
          className="z-40 relative shadow-lg"
        >
          {/* blur overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-lg"
            style={{
              backdropFilter: 'blur(4px)'
            }}
          />
          {toolbarContent}
        </div>
      )}
    </>
  )
}
