import React, { CSSProperties, ReactNode, type FC } from 'react'
import { ImageGallery } from '@webview/components/image/image-gallery'
import {
  ImagePreview,
  type ImagePreviewProps
} from '@webview/components/image/image-preview'
import { Link } from '@webview/components/link'
import { Video, type VideoProps } from '@webview/components/video'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown/lib'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import type { Pluggable } from 'unified'

import {
  PreCodeBlock,
  SingleCodeBlock,
  type SingleCodeBlockProps
} from './code-block'
import { type HighlighterProps } from './highlighter/highlighter'
import { type MermaidProps } from './mermaid/mermaid'
import { type PreProps } from './pre/pre'

import './markdown.css'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@webview/components/ui/table'
import { cn } from '@webview/utils/common'

import { escapeBrackets, escapeMhchem, fixMarkdownBold } from './utils'

export interface MarkdownProps extends React.HTMLAttributes<HTMLDivElement> {
  fontSize?: number
  headerMultiple?: number
  lineHeight?: number
  marginMultiple?: number

  allowHtml?: boolean
  children: string
  className?: string
  componentProps?: {
    a?: Partial<React.AnchorHTMLAttributes<HTMLAnchorElement>>
    highlight?: Partial<HighlighterProps>
    img?: Partial<ImagePreviewProps>
    mermaid?: Partial<MermaidProps>
    pre?: Partial<PreProps>
    video?: Partial<VideoProps>
    code?: Partial<SingleCodeBlockProps>
  }
  components?: Components
  customRender?: (dom: ReactNode, context: { text: string }) => ReactNode
  enableImageGallery?: boolean
  enableLatex?: boolean
  enableMermaid?: boolean
  onDoubleClick?: () => void
  rehypePlugins?: Pluggable[]
  remarkPlugins?: Pluggable[]
  style?: CSSProperties
  variant?: 'normal' | 'chat'
}

export const Markdown: FC<MarkdownProps> = ({
  children,
  className,
  style,
  onDoubleClick,
  enableLatex = true,
  enableMermaid = true,
  enableImageGallery = true,
  componentProps,
  allowHtml = true,
  fontSize,
  headerMultiple,
  marginMultiple,
  variant = 'normal',
  lineHeight,
  rehypePlugins,
  remarkPlugins,
  components = {},
  customRender,
  ...rest
}) => {
  const isChatMode = variant === 'chat'

  const escapedContent = enableLatex
    ? fixMarkdownBold(escapeMhchem(escapeBrackets(children)))
    : fixMarkdownBold(children)

  const memoComponents: Components = {
    a: (props: any) => <Link {...props} {...componentProps?.a} />,
    img: enableImageGallery
      ? (props: any) => (
          <ImagePreview
            {...props}
            {...componentProps?.img}
            style={
              isChatMode
                ? {
                    height: 'auto',
                    maxWidth: 640,
                    ...componentProps?.img?.style
                  }
                : componentProps?.img?.style
            }
          />
        )
      : undefined,
    pre: (props: any) => (
      <PreCodeBlock
        enableMermaid={enableMermaid}
        highlight={componentProps?.highlight}
        mermaid={componentProps?.mermaid}
        {...props}
        {...componentProps?.pre}
      />
    ),
    code: (props: any) => (
      <SingleCodeBlock {...props} {...componentProps?.code} />
    ),
    video: (props: any) => <Video {...props} {...componentProps?.video} />,
    table: (props: any) => <Table {...props} />,
    thead: (props: any) => <TableHeader {...props} />,
    tbody: (props: any) => <TableBody {...props} />,
    tr: (props: any) => <TableRow {...props} />,
    th: (props: any) => (
      <TableHead {...props} className={cn('border', props.className)} />
    ),
    td: (props: any) => (
      <TableCell {...props} className={cn('border', props.className)} />
    ),
    ...components
  }

  const innerRehypePlugins = Array.isArray(rehypePlugins)
    ? rehypePlugins
    : [rehypePlugins]

  const memoRehypePlugins = [
    allowHtml && rehypeRaw,
    enableLatex && [rehypeKatex, { output: 'mathml' }],
    ...innerRehypePlugins
  ].filter(Boolean) as any

  const innerRemarkPlugins = Array.isArray(remarkPlugins)
    ? remarkPlugins
    : [remarkPlugins]
  const memoRemarkPlugins = [
    remarkGfm,
    enableLatex && remarkMath,
    isChatMode && remarkBreaks,
    ...innerRemarkPlugins
  ].filter(Boolean) as any

  const defaultDOM = (
    <ImageGallery enable={enableImageGallery}>
      <ReactMarkdown
        components={memoComponents}
        rehypePlugins={memoRehypePlugins}
        remarkPlugins={memoRemarkPlugins}
        {...rest}
      >
        {escapedContent}
      </ReactMarkdown>
    </ImageGallery>
  )

  const markdownContent = customRender
    ? customRender(defaultDOM, { text: escapedContent })
    : defaultDOM

  const customStyle = {
    ...style,
    ...(fontSize && { '--aide-markdown-font-size': `${fontSize}px` }),
    ...(headerMultiple && {
      '--aide-markdown-header-multiple': headerMultiple
    }),
    ...(lineHeight && { '--aide-markdown-line-height': lineHeight }),
    ...(marginMultiple && {
      '--aide-markdown-margin-multiple': marginMultiple
    })
  } as React.CSSProperties

  return (
    <article
      className={cn('message-markdown', className)}
      data-code-type="markdown"
      onDoubleClick={onDoubleClick}
      style={customStyle}
    >
      {markdownContent}
    </article>
  )
}
