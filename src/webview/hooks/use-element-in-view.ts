import { useEffect, useMemo, useRef, useState } from 'react'

export interface UseElementInViewProps<T extends HTMLElement = HTMLElement> {
  ref?: React.RefObject<T>
}

export function useElementInView<T extends HTMLElement = HTMLElement>(
  props?: UseElementInViewProps<T>
): { ref: React.RefObject<T>; inView: boolean } {
  const { ref = useRef<T>(null) } = props || {}
  const [inView, setInView] = useState(false)

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setInView(entry?.isIntersecting ?? false)
      ),
    [ref]
  )

  useEffect(() => {
    if (!ref.current) return
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}
