import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState
} from 'react'
import { getLuminance } from 'color2k'

type GlobalContextValue = {
  isApiInit: boolean
  isDarkTheme: boolean
}

const GlobalContext = createContext<GlobalContextValue | null>(null)

export const useGlobalContext = () => {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error(
      'useGlobalContext must be used within a GlobalContextProvider'
    )
  }
  return context
}

export const GlobalContextProvider: FC<
  Omit<GlobalContextValue, 'isDarkTheme'> & { children: React.ReactNode }
> = ({ isApiInit, children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true)

  useEffect(() => {
    const updateTheme = () => {
      const backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--vscode-sideBarTitle-background')
        .trim()
      setIsDarkTheme(getLuminance(backgroundColor) < 0.5)
    }

    // Initial theme check
    updateTheme()

    // Watch for theme changes
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <GlobalContext.Provider value={{ isApiInit, isDarkTheme }}>
      {children}
    </GlobalContext.Provider>
  )
}
