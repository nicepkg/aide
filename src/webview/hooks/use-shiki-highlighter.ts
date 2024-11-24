import { useEffect, useState } from 'react'
import { useGlobalContext } from '@webview/contexts/global-context'
import { logger } from '@webview/utils/logger'
import { codeToHtml } from 'shiki'

export interface UseShikiHighlighterProps {
  code: string
  language: string
}

export const useShikiHighlighter = (props: UseShikiHighlighterProps) => {
  const { code, language } = props
  const { isDarkTheme } = useGlobalContext()
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const highlightCode = async () => {
      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme: isDarkTheme ? 'dark-plus' : 'light-plus'
        })
        setHighlightedCode(html)
      } catch (error) {
        logger.warn('Failed to highlight code:', error)
      } finally {
        setIsLoading(false)
      }
    }

    highlightCode()
  }, [code, language, isDarkTheme])

  return { highlightedCode, isLoading }
}
