import { FC } from 'react'

import { type HighlighterProps } from './highlighter/highlighter'
import { type MermaidProps } from './mermaid/mermaid'
import { Pre, PreMermaid } from './pre/pre'

export const FALLBACK_LANG = 'txt'

export const useCode = (raw: any) => {
  if (!raw) return

  const { children, className } = raw.props

  if (!children) return

  const content = Array.isArray(children) ? (children[0] as string) : children
  const lang = className?.replace('language-', '') || FALLBACK_LANG

  return {
    content,
    lang
  }
}

interface CodeBlockProps {
  children: any
  enableMermaid?: boolean
  highlight?: HighlighterProps
  mermaid?: MermaidProps
}

export const CodeBlock: FC<CodeBlockProps> = ({
  enableMermaid,
  highlight,
  mermaid,
  ...rest
}) => {
  const code = useCode(
    Array.isArray(rest?.children) ? rest?.children[0] : rest?.children
  )

  if (!code) return

  if (enableMermaid && code.lang === 'mermaid')
    return <PreMermaid {...mermaid}>{code.content}</PreMermaid>

  return (
    <Pre language={code.lang} {...highlight} {...rest}>
      {code.content}
    </Pre>
  )
}
