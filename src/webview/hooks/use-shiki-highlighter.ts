import { useEffect, useState } from 'react'
import { logger } from '@webview/utils/logger'
import { codeToHtml } from 'shiki'

export interface UseShikiHighlighterProps {
  code: string
  language: string
}

export const useShikiHighlighter = (props: UseShikiHighlighterProps) => {
  const { code, language } = props
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const highlightCode = async () => {
      try {
        const html = await codeToHtml(code, {
          lang: language,
          theme: 'dark-plus'
        })
        setHighlightedCode(html)
      } catch (error) {
        logger.warn('Failed to highlight code:', error)
      } finally {
        setIsLoading(false)
      }
    }

    highlightCode()
  }, [code, language])

  return { highlightedCode, isLoading }
}
