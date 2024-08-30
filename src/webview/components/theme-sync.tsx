import { useEffect, useState } from 'react'
import { hsla, parseToHsla } from 'color2k'

const THEME_CHECK_INTERVAL = 100

const THEME_VARIABLES = {
  '--background': '--vscode-editor-background',
  '--foreground': '--vscode-editor-foreground',
  '--title': '--vscode-sideBarTitle-background',
  '--title-foreground': '--vscode-sideBarTitle-foreground',
  '--card': '--vscode-editorWidget-background',
  '--card-foreground': '--vscode-editorWidget-foreground',
  '--popover': '--vscode-editorHoverWidget-background',
  '--popover-foreground': '--vscode-editorHoverWidget-foreground',
  '--primary': '--vscode-button-background',
  '--primary-foreground': '--vscode-button-foreground',
  '--secondary': '--vscode-button-secondaryBackground',
  '--secondary-foreground': '--vscode-button-secondaryForeground',
  '--muted': '--vscode-editorGutter-background',
  '--muted-foreground': '--vscode-editorGhostText-foreground',
  '--accent': '--vscode-focusBorder',
  '--accent-foreground': '--vscode-button-foreground',
  '--destructive': '--vscode-errorForeground',
  '--destructive-foreground': '--vscode-inputValidation-errorBackground',
  '--border': '--vscode-widget-border',
  '--input': '--vscode-input-background',
  '--ring': '--vscode-focusBorder',
  '--radius': '0.5rem'
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

// {
//   '--background': '#1f1f1f', // --vscode-editor-background
//   '--foreground': '#cccccc', // --vscode-editor-foreground
//   '--card': '#202020', // --vscode-editorWidget-background
//   '--card-foreground': '#cccccc', // --vscode-editorWidget-foreground
//   '--popover': '#202020', // --vscode-editorHoverWidget-background
//   '--popover-foreground': '#cccccc', // --vscode-editorHoverWidget-foreground
//   '--primary': '#0078d4', // --vscode-button-background
//   '--primary-foreground': '#ffffff', // --vscode-button-foreground
//   '--secondary': '#313131', // --vscode-button-secondaryBackground
//   '--secondary-foreground': '#cccccc', // --vscode-button-secondaryForeground
//   '--muted': '#1f1f1f', // --vscode-editorGutter-background
//   '--muted-foreground': 'rgba(255, 255, 255, 0.34)', // --vscode-editorGhostText-foreground
//   '--accent': '#0078d4', // --vscode-focusBorder
//   '--accent-foreground': '#cccccc', // --vscode-foreground
//   '--destructive': '#f85149', // --vscode-errorForeground
//   '--destructive-foreground': '#5a1d1d', // --vscode-inputValidation-errorBackground
//   '--border': '#313131', // --vscode-widget-border
//   '--input': '#313131', // --vscode-input-background
//   '--ring': '#0078d4', // --vscode-focusBorder
//   '--radius': '0.5rem', // 这个没有直接对应的 VSCode 变量,保持原值
// }

// @layer base {
//   :root {
//     --background: #ffffff;
//     --foreground: #020817;
//     --card: #ffffff;
//     --card-foreground: #020817;
//     --popover: #ffffff;
//     --popover-foreground: #020817;
//     --primary: #3b82f6;
//     --primary-foreground: #f8fafc;
//     --secondary: #f1f5f9;
//     --secondary-foreground: #0f1729;
//     --muted: #f1f5f9;
//     --muted-foreground: #64748b;
//     --accent: #f1f5f9;
//     --accent-foreground: #0f1729;
//     --destructive: #ef4444;
//     --destructive-foreground: #f8fafc;
//     --border: #e2e8f0;
//     --input: #e2e8f0;
//     --ring: #3b82f6;
//     --radius: 0.5rem;
//     --chart-1: #e74c3c;
//     --chart-2: #2ecc71;
//     --chart-3: #34495e;
//     --chart-4: #f1c40f;
//     --chart-5: #e67e22;
//   }

//   .dark {
//     --background: #020817;
//     --foreground: #f8fafc;
//     --card: #020817;
//     --card-foreground: #f8fafc;
//     --popover: #020817;
//     --popover-foreground: #f8fafc;
//     --primary: #60a5fa;
//     --primary-foreground: #0f1729;
//     --secondary: #1e293b;
//     --secondary-foreground: #f8fafc;
//     --muted: #1e293b;
//     --muted-foreground: #94a3b8;
//     --accent: #1e293b;
//     --accent-foreground: #f8fafc;
//     --destructive: #7f1d1d;
//     --destructive-foreground: #f8fafc;
//     --border: #1e293b;
//     --input: #1e293b;
//     --ring: #3b82f6;
//     --chart-1: #3366cc;
//     --chart-2: #33a02c;
//     --chart-3: #e6983b;
//     --chart-4: #9933cc;
//     --chart-5: #e63939;
//   }
// }
