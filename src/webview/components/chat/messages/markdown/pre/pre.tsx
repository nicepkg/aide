import React, { FC } from 'react'
import { cn } from '@webview/utils/common'
import { getShikiLanguage } from '@webview/utils/shiki'

import { Highlighter, type HighlighterProps } from '../highlighter/highlighter'
import { Mermaid, type MermaidProps } from '../mermaid/mermaid'

const FALLBACK_LANG = 'typescript'

export type PreProps = HighlighterProps

export const Pre: FC<PreProps> = ({
  fileRelativePath,
  language = FALLBACK_LANG,
  children,
  className,
  style,
  ...rest
}) => {
  const [maybeLanguage, relativePath] = language.split(':')
  const shikiLang = getShikiLanguage({
    unknownLang: maybeLanguage,
    path: fileRelativePath
  })

  return (
    <Highlighter
      className={cn('overflow-hidden my-2', className)}
      fileRelativePath={fileRelativePath || relativePath}
      language={shikiLang}
      style={style}
      defaultExpanded
      {...rest}
    >
      {children}
    </Highlighter>
  )
}

export const PreMermaid: FC<MermaidProps> = ({
  children,
  className,
  style,
  ...rest
}) => (
  <Mermaid
    className={cn('overflow-hidden my-2', className)}
    style={style}
    defaultExpanded
    {...rest}
  >
    {children}
  </Mermaid>
)
