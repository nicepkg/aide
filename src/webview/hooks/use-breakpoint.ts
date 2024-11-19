import { useEffect, useState } from 'react'

// Define breakpoints according to Tailwind default configuration
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px'
} as const

type Breakpoint = keyof typeof breakpoints

export const useBreakpoint = (breakpoint: Breakpoint) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Create media query
    const query = window.matchMedia(`(min-width: ${breakpoints[breakpoint]})`)

    // Set initial value
    setMatches(query.matches)

    // Create event listener
    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    // Add event listener
    query.addEventListener('change', handler)

    // Cleanup
    return () => {
      query.removeEventListener('change', handler)
    }
  }, [breakpoint])

  return matches
}

// Helper hooks for specific breakpoints
export const useIsSm = () => useBreakpoint('sm')
export const useIsMd = () => useBreakpoint('md')
export const useIsLg = () => useBreakpoint('lg')
export const useIsXl = () => useBreakpoint('xl')
export const useIs2Xl = () => useBreakpoint('2xl')
