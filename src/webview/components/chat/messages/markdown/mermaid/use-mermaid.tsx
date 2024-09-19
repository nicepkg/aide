import { useEffect, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

export const useMermaid = (content: string) => {
  const [mermaidContent, setMermaidContent] = useState<string>()
  const { theme } = useTheme()

  useEffect(() => {
    mermaid.initialize({
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      securityLevel: 'loose',
      startOnLoad: true,
      theme: 'dark'
    })
    mermaid.contentLoaded()
  }, [mermaidContent, theme])

  const checkSyntax = async (textStr: string) => {
    try {
      if (await mermaid.parse(textStr)) {
        setMermaidContent(textStr)
      }
    } catch {}
  }

  useEffect(() => {
    checkSyntax(content)
  }, [content])

  return () => (
    <pre className="mermaid flex items-center justify-center text-sm overflow-auto">
      {mermaidContent}
    </pre>
  )
}
