import { useEffect, useState } from 'react'
import { hsla, parseToHsla } from 'color2k'

const THEME_CHECK_INTERVAL = 100
const THEME_VARIABLES = {
  '--background': '--vscode-editor-background',
  '--foreground': '--vscode-editor-foreground',
  '--card': '--vscode-editor-background',
  '--card-foreground': '--vscode-editor-foreground',
  '--popover': '--vscode-editorWidget-background',
  '--popover-foreground': '--vscode-editorWidget-foreground',
  '--primary': '--vscode-button-background',
  '--primary-foreground': '--vscode-button-foreground',
  '--secondary': '--vscode-button-secondaryBackground',
  '--secondary-foreground': '--vscode-button-secondaryForeground',
  '--muted': '--vscode-input-background',
  '--muted-foreground': '--vscode-input-placeholderForeground',
  '--accent': '--vscode-textLink-activeForeground',
  '--accent-foreground': '--vscode-editor-foreground',
  '--destructive': '--vscode-errorForeground',
  '--destructive-foreground': '--vscode-editor-background',
  '--border': '--vscode-panel-border',
  '--input': '--vscode-input-background',
  '--ring': '--vscode-focusBorder'
}

export function ThemeSync() {
  const [themeLoaded, setThemeLoaded] = useState(false)

  useEffect(() => {
    const intervalId = window.setInterval(
      () => checkAndSyncTheme(intervalId),
      THEME_CHECK_INTERVAL
    )
    const observer = setupMutationObserver()

    return () => {
      clearInterval(intervalId)
      observer.disconnect()
    }
  }, [themeLoaded])

  const checkAndSyncTheme = (intervalId: number) => {
    if (!themeLoaded && isThemeLoaded()) {
      syncTheme()
      setThemeLoaded(true)
      clearInterval(intervalId)
    }
  }

  const setupMutationObserver = () => {
    const observer = new MutationObserver(() => {
      if (themeLoaded) syncTheme()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return observer
  }

  return null
}

const isThemeLoaded = () => {
  const style = getComputedStyle(document.documentElement)
  return style.getPropertyValue('--vscode-button-foreground') !== ''
}

const syncTheme = () => {
  const style = getComputedStyle(document.documentElement)
  const vscodeVars = Object.fromEntries(
    Object.entries(THEME_VARIABLES).map(([key, value]) => [
      key,
      style.getPropertyValue(value)
    ])
  )

  Object.entries(vscodeVars).forEach(([key, value]) => {
    if (value) {
      try {
        const [h, s, l, a] = parseToHsla(value)
        const hslString = hsla(h, s, l, a)
        const hslValues = hslString.match(/\d+(\.\d+)?/g)
        if (hslValues && hslValues.length >= 3) {
          document.body.style.setProperty(
            key,
            `${hslValues[0]} ${hslValues[1]}% ${hslValues[2]}%`
          )
        }
      } catch (error) {
        console.warn(`Failed to parse color for ${key}: ${value}`, error)
      }
    }
  })
}
