import { useEffect, useState } from 'react'
import { createHighlighter, type Highlighter } from 'shiki'

const highlighterCache: Record<string, Highlighter> = {}

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
      let highlighter: Highlighter

      if (highlighterCache[language]) {
        highlighter = highlighterCache[language]!
      } else {
        highlighter = await createHighlighter({
          themes: ['dark-plus'],
          langs: [language]
        })
        highlighterCache[language] = highlighter
      }

      const highlighted = await highlighter.codeToHtml(code, {
        lang: language,
        theme: 'dark-plus'
      })
      setHighlightedCode(highlighted)
      setIsLoading(false)
    }

    highlightCode()
  }, [code, language])

  return { highlightedCode, isLoading }
}
