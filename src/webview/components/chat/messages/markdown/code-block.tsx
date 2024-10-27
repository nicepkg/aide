import { FC } from 'react'
import { useGetFullPath } from '@webview/hooks/api/use-get-full-path'
import { api } from '@webview/services/api-client'

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

interface PreCodeBlockProps {
  children: any
  enableMermaid?: boolean
  highlight?: HighlighterProps
  mermaid?: MermaidProps
}

export const PreCodeBlock: FC<PreCodeBlockProps> = ({
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

export interface SingleCodeBlockProps {
  children: any
}
export const SingleCodeBlock: FC<SingleCodeBlockProps> = props => {
  const code: string =
    (Array.isArray(props?.children) ? props?.children[0] : props?.children) ||
    ''

  const { data: fileFullPath } = useGetFullPath({
    path: code,
    returnNullIfNotExists: true
  })

  const openFileInEditor = async () => {
    if (!fileFullPath) return
    await api.file.openFileInEditor({
      path: fileFullPath
    })
  }

  return (
    <code
      style={{
        cursor: fileFullPath ? 'pointer' : 'text'
      }}
      onClick={openFileInEditor}
    >
      {code}
    </code>
  )
}
