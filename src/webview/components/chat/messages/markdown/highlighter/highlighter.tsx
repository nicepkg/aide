import React, { type CSSProperties } from 'react'
import { CopyIcon } from '@radix-ui/react-icons'
import { CollapsibleCode } from '@webview/components/collapsible-code'
import { FileIcon } from '@webview/components/file-icon'
import { Button } from '@webview/components/ui/button'
import { useShikiHighlighter } from '@webview/hooks/use-shiki-highlighter'
import { getFileNameFromPath } from '@webview/utils/path'
import { toast } from 'sonner'

export interface HighlighterProps {
  children: string
  language: string
  style?: CSSProperties
  className?: string
  copyable?: boolean
  fileRelativePath?: string
  defaultExpanded?: boolean
}

export const Highlighter: React.FC<HighlighterProps> = ({
  children,
  language,
  style,
  className = '',
  copyable = true,
  fileRelativePath,
  defaultExpanded
}) => {
  const { highlightedCode, isLoading } = useShikiHighlighter({
    code: children,
    language
  })

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children)
    toast.success('Code copied to clipboard')
  }

  const actions = (
    <>
      {copyable && (
        <Button
          className="transition-colors"
          onClick={copyToClipboard}
          size="iconXss"
          variant="ghost"
          aria-label="Copy code"
        >
          <CopyIcon className="size-3" />
        </Button>
      )}
    </>
  )

  const fileNameComponent = fileRelativePath ? (
    <div className="flex flex-shrink-0 items-center mr-2">
      <FileIcon className="size-3 mr-1" filePath={fileRelativePath} />
      <span>{getFileNameFromPath(fileRelativePath)}</span>
    </div>
  ) : null

  return (
    <CollapsibleCode
      title={fileNameComponent || language}
      actions={actions}
      className={className}
      isLoading={isLoading}
      defaultExpanded={defaultExpanded}
    >
      <div
        style={style}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </CollapsibleCode>
  )
}
