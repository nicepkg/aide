import { useEffect, useState } from 'react'
import { hsla, parseToHsla } from 'color2k'

export function ThemeSync() {
  const [themeLoaded, setThemeLoaded] = useState(false)

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!themeLoaded && checkVariables()) {
        syncTheme()
        setThemeLoaded(true)
        clearInterval(intervalId)
      }
    }, 100)

    const observer = new MutationObserver(() => {
      if (themeLoaded) {
        syncTheme()
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => {
      clearInterval(intervalId)
      observer.disconnect()
    }
  }, [themeLoaded])

  return null
}

const checkVariables = () => {
  const style = getComputedStyle(document.documentElement)
  return style.getPropertyValue('--vscode-button-foreground')
}

const syncTheme = () => {
  const style = getComputedStyle(document.documentElement)
  const vscodeVars = {
    '--background': style.getPropertyValue('--vscode-editor-background'),
    '--foreground': style.getPropertyValue('--vscode-editor-foreground'),
    '--card': style.getPropertyValue('--vscode-editor-background'),
    '--card-foreground': style.getPropertyValue('--vscode-editor-foreground'),
    '--popover': style.getPropertyValue('--vscode-editorWidget-background'),
    '--popover-foreground': style.getPropertyValue(
      '--vscode-editorWidget-foreground'
    ),
    '--primary': style.getPropertyValue('--vscode-button-background'),
    '--primary-foreground': style.getPropertyValue(
      '--vscode-button-foreground'
    ),
    '--secondary': style.getPropertyValue(
      '--vscode-button-secondaryBackground'
    ),
    '--secondary-foreground': style.getPropertyValue(
      '--vscode-button-secondaryForeground'
    ),
    '--muted': style.getPropertyValue('--vscode-input-background'),
    '--muted-foreground': style.getPropertyValue(
      '--vscode-input-placeholderForeground'
    ),
    '--accent': style.getPropertyValue('--vscode-textLink-activeForeground'),
    '--accent-foreground': style.getPropertyValue('--vscode-editor-foreground'),
    '--destructive': style.getPropertyValue('--vscode-errorForeground'),
    '--destructive-foreground': style.getPropertyValue(
      '--vscode-editor-background'
    ),
    '--border': style.getPropertyValue('--vscode-panel-border'),
    '--input': style.getPropertyValue('--vscode-input-background'),
    '--ring': style.getPropertyValue('--vscode-focusBorder')
  }

  Object.entries(vscodeVars).forEach(([key, value]) => {
    if (value) {
      try {
        const [h, s, l, a] = parseToHsla(value)
        const hslString = hsla(h, s, l, a)
        const hslValues = hslString.match(/\d+(\.\d+)?/g)
        if (hslValues && hslValues.length >= 3) {
          document.documentElement.style.setProperty(
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
