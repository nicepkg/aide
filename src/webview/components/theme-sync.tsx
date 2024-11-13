import { useEffect, useState } from 'react'
import { logger } from '@webview/utils/logger'
import { hsla, parseToHsla } from 'color2k'

const THEME_CHECK_INTERVAL = 100

const THEME_MAPPING = {
  '--background': '--vscode-sideBarTitle-background',
  '--foreground': '--vscode-sideBarTitle-foreground',
  '--title': '--vscode-sideBarTitle-background',
  '--title-foreground': '--vscode-sideBarTitle-foreground',
  '--primary': '--vscode-button-background',
  '--primary-foreground': '--vscode-button-foreground',
  '--destructive': '--vscode-errorForeground',
  '--destructive-foreground': '--vscode-editor-foreground',
  '--radius': '0.5rem'
}

const DARK_ADJUSTMENTS = {
  '--card': 0.02,
  '--card-foreground': -0.02,
  '--popover': -0.02,
  '--popover-foreground': 0.02,
  '--secondary': 0.05,
  '--secondary-foreground': -0.05,
  '--muted': -0.07,
  '--muted-foreground': -0.1,
  '--accent': 0.07,
  '--accent-foreground': -0.07,
  '--border': 0.1,
  '--input': 0.05,
  '--ring': 0.1
}

const LIGHT_ADJUSTMENTS = {
  '--card': -0.02,
  '--card-foreground': 0.02,
  '--popover': 0.02,
  '--popover-foreground': -0.02,
  '--secondary': -0.05,
  '--secondary-foreground': 0.05,
  '--muted': 0.07,
  '--muted-foreground': 0.1,
  '--accent': -0.07,
  '--accent-foreground': 0.07,
  '--border': -0.1,
  '--input': -0.05,
  '--ring': -0.1
}

export const ThemeSync = () => {
  const [themeLoaded, setThemeLoaded] = useState(false)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!themeLoaded && isThemeLoaded()) {
        syncTheme()
        setThemeLoaded(true)
        clearInterval(intervalId)
      }
    }, THEME_CHECK_INTERVAL)

    const observer = new MutationObserver(() => {
      if (themeLoaded) syncTheme()
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

const isThemeLoaded = () => {
  const style = getComputedStyle(document.documentElement)
  return style.getPropertyValue('--vscode-button-foreground') !== ''
}

const syncTheme = () => {
  const style = getComputedStyle(document.documentElement)
  const themeVars = Object.fromEntries(
    Object.entries(THEME_MAPPING).map(([key, cssVar]) => [
      key,
      style.getPropertyValue(cssVar)
    ])
  )

  const background = themeVars['--background']!
  const foreground = themeVars['--foreground']!
  const primary = themeVars['--primary']!

  const isLightTheme = isLightColor(background)
  const ADJUSTMENTS = isLightTheme ? LIGHT_ADJUSTMENTS : DARK_ADJUSTMENTS

  Object.entries({ ...THEME_MAPPING, ...ADJUSTMENTS }).forEach(
    ([key, value]) => {
      if (key in THEME_MAPPING) {
        value = themeVars[key]!
      }
      if (value) {
        try {
          let [h, s, l, a] = parseToHsla(
            typeof value === 'string' ? value : background
          )
          if (key in ADJUSTMENTS) {
            const amount = ADJUSTMENTS[key as keyof typeof ADJUSTMENTS]
            switch (key) {
              case '--ring':
                ;[h, s, l, a] = adjustLightness(primary, amount)
                break
              case '--card-foreground':
              case '--popover-foreground':
              case '--secondary-foreground':
              case '--muted-foreground':
              case '--accent-foreground':
                ;[h, s, l, a] = adjustLightness(foreground, amount)
                break
              default:
                ;[h, s, l, a] = adjustLightness(background, amount)
            }
          }

          const hslString = hsla(h, s, l, a)
          const hslValues = hslString.match(/\d+(\.\d+)?/g)
          if (hslValues && hslValues.length >= 3) {
            document.body.style.setProperty(
              key,
              `${hslValues[0]} ${hslValues[1]}% ${hslValues[2]}%`
            )
          }
        } catch (error) {
          logger.warn(`Failed to parse color for ${key}: ${value}`, error)
        }
      }
    }
  )
}

const adjustLightness = (color: string, amount: number) => {
  const [h, s, l, a] = parseToHsla(color)
  const newL = Math.max(0, Math.min(1, l + amount))
  return [h, s, newL, a] as const
}

const isLightColor = (color: string): boolean => {
  const [, , l] = parseToHsla(color)
  return l > 0.5
}
