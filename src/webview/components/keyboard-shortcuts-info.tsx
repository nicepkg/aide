import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@webview/components/ui/button'
import { cn } from '@webview/utils/common'
import { useMeasure } from 'react-use'

export interface ShortcutInfo {
  key: string | string[]
  description: string
  weight?: number
}

interface KeyboardShortcutsInfoProps
  extends React.ButtonHTMLAttributes<HTMLDivElement> {
  shortcuts: ShortcutInfo[]
}

export const KeyboardShortcutsInfo: React.FC<KeyboardShortcutsInfoProps> = ({
  shortcuts,
  className,
  ...props
}) => {
  const [visibleShortcuts, setVisibleShortcuts] = useState(shortcuts)
  const [containerRef, { width: containerWidth }] = useMeasure<HTMLDivElement>()
  const shortcutRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (containerWidth === undefined) return

    const updateVisibleShortcuts = () => {
      let availableWidth = containerWidth
      const sortedShortcuts = [...shortcuts].sort(
        (a, b) => (b.weight || 0) - (a.weight || 0)
      )

      const visibleOnes = sortedShortcuts.filter((shortcut, index) => {
        const shortcutElement = shortcutRefs.current[index]
        if (shortcutElement) {
          const shortcutWidth = shortcutElement.offsetWidth
          if (availableWidth >= shortcutWidth) {
            availableWidth -= shortcutWidth
            return true
          }
        }
        return false
      })

      setVisibleShortcuts(visibleOnes)
    }

    updateVisibleShortcuts()
  }, [shortcuts, containerWidth])

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex shrink-0 items-center p-2 text-sm text-muted-foreground border-t w-full overflow-hidden',
        className
      )}
      {...props}
    >
      {shortcuts.map((shortcut, index) => (
        <div
          key={index}
          ref={el => {
            shortcutRefs.current[index] = el
          }}
          className={cn(
            'mr-2 flex items-center whitespace-nowrap',
            !visibleShortcuts.includes(shortcut) && 'absolute invisible'
          )}
        >
          {Array.isArray(shortcut.key) ? (
            shortcut.key.map((k, i) => (
              <Button
                key={i}
                size="xsss"
                variant="outline"
                className="mr-1 pointer-events-none"
              >
                {k}
              </Button>
            ))
          ) : (
            <Button
              size="xsss"
              variant="outline"
              className="mr-1 pointer-events-none"
            >
              {shortcut.key}
            </Button>
          )}
          <span className="text-xs opacity-80">{shortcut.description}</span>
        </div>
      ))}
    </div>
  )
}
