import * as React from 'react'
import { cn } from '@webview/utils/common'
import Typed from 'typed.js'

interface TypedTextProps {
  /**
   * The strings to type out
   * Can be strings or objects: { text: string, delay?: number }
   */
  strings: (string | { text: string; delay?: number })[]
  /**
   * Type speed in milliseconds
   */
  typeSpeed?: number
  /**
   * Time before typing starts in milliseconds
   */
  startDelay?: number
  /**
   * Time between strings in milliseconds
   */
  backDelay?: number
  /**
   * False = type all strings, True = only last string
   */
  smartBackspace?: boolean
  /**
   * Backspacing speed in milliseconds
   */
  backSpeed?: number
  /**
   * Loop strings
   */
  loop?: boolean
  /**
   * Show cursor
   */
  showCursor?: boolean
  /**
   * Character for cursor
   */
  cursorChar?: string
  /**
   * Class name for the wrapper
   */
  className?: string
  /**
   * Callback when typing is complete
   */
  onComplete?: () => void
}

export const TypedText: React.FC<
  TypedTextProps & React.RefAttributes<HTMLSpanElement>
> = ({
  strings,
  typeSpeed = 50,
  startDelay = 0,
  backDelay = 700,
  smartBackspace = true,
  backSpeed = 30,
  loop = false,
  showCursor = true,
  cursorChar = '|',
  className,
  onComplete,
  ref
}) => {
  const el = React.useRef<HTMLSpanElement>(null)
  const typed = React.useRef<Typed | null>(null)

  React.useEffect(() => {
    const processedStrings = strings.map(str =>
      typeof str === 'string' ? str : str.text
    )

    const options = {
      strings: processedStrings,
      typeSpeed,
      startDelay,
      backDelay,
      smartBackspace,
      backSpeed,
      loop,
      showCursor,
      cursorChar,
      onComplete: () => {
        onComplete?.()
      }
    }

    // 初始化 Typed 实例
    if (el.current) {
      typed.current = new Typed(el.current, options)
    }

    // 清理
    return () => {
      typed.current?.destroy()
    }
  }, [
    strings,
    typeSpeed,
    startDelay,
    backDelay,
    smartBackspace,
    backSpeed,
    loop,
    showCursor,
    cursorChar,
    onComplete
  ])

  return (
    <span
      ref={node => {
        el.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }}
      className={cn(
        'inline-block',
        showCursor &&
          'after:ml-0.5 after:animate-blink after:content-[""] after:border-r-2 after:border-current',
        className
      )}
    />
  )
}

TypedText.displayName = 'TypedText'
