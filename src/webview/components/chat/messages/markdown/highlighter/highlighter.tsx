import React, { type CSSProperties } from 'react'
import { InlineDiffTaskState } from '@extension/registers/inline-diff-register/types'
import {
  CopyIcon,
  ExternalLinkIcon,
  PlayIcon,
  ReloadIcon,
  StopIcon
} from '@radix-ui/react-icons'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import { CollapsibleCode } from '@webview/components/collapsible-code'
import { FileIcon } from '@webview/components/file-icon'
import { Button } from '@webview/components/ui/button'
import { useFileInfoForMessage } from '@webview/hooks/api/use-file-info-for-message'
import { useApplyCode } from '@webview/hooks/chat/use-apply-code'
import { useShikiHighlighter } from '@webview/hooks/use-shiki-highlighter'
import { api } from '@webview/services/api-client'
import { getFileNameFromPath } from '@webview/utils/path'
import parse from 'html-react-parser'
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
  children: code,
  language,
  style,
  className = '',
  copyable = true,
  fileRelativePath,
  defaultExpanded
}) => {
  const { startLine, endLine } = getRangeFromCode(code)
  const { data: fileInfo } = useFileInfoForMessage({
    relativePath: fileRelativePath,
    startLine,
    endLine
  })

  const fileFullPath = fileInfo?.fullPath
  const children = startLine === undefined ? code : fileInfo?.content || ''

  const { isApplying, applyStatus, applyCode, cancelApply, reapplyCode } =
    useApplyCode(fileFullPath, children)

  const { highlightedCode, isLoading } = useShikiHighlighter({
    code: children,
    language
  })

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children)
    toast.success('Code copied to clipboard')
  }

  const openFileInEditor = async () => {
    if (!fileFullPath) return
    await api.file.openFileInEditor({
      path: fileFullPath,
      startLine
    })
  }

  const renderApplyButton = () => {
    const getButtonProps = () => {
      if (isApplying) {
        return {
          onClick: cancelApply,
          icon: <StopIcon className="size-3" />,
          text: 'Stopping...'
        }
      }
      if (applyStatus === InlineDiffTaskState.Finished) {
        return {
          onClick: () => reapplyCode(),
          icon: <ReloadIcon className="size-3" />,
          text: 'Reapply'
        }
      }
      return {
        onClick: () => applyCode(),
        icon: <PlayIcon className="size-3" />,
        text: 'Apply'
      }
    }

    const { onClick, icon, text } = getButtonProps()

    return (
      <Button
        className="transition-colors gap-1"
        onClick={onClick}
        size="xs"
        variant="ghost"
        aria-label={text}
        disabled={isApplying}
      >
        {icon}
        <span>{text}</span>
      </Button>
    )
  }

  const renderActions = () => (
    <>
      {Boolean(fileFullPath) && (
        <>
          {renderApplyButton()}
          <ButtonWithTooltip
            className="transition-colors gap-1"
            onClick={openFileInEditor}
            size="iconXs"
            variant="ghost"
            tooltip="Open"
            aria-label="Open file in editor"
          >
            <ExternalLinkIcon className="size-3" />
          </ButtonWithTooltip>
        </>
      )}
      {copyable && (
        <ButtonWithTooltip
          className="transition-colors gap-1"
          onClick={copyToClipboard}
          size="iconXs"
          variant="ghost"
          tooltip="Copy"
          aria-label="Copy code"
        >
          <CopyIcon className="size-3" />
        </ButtonWithTooltip>
      )}
    </>
  )

  const renderFileNameComponent = () =>
    fileRelativePath ? (
      <div className="flex flex-shrink-0 items-center mr-2">
        <FileIcon className="size-3 mr-1" filePath={fileRelativePath} />
        <span>{getFileNameFromPath(fileRelativePath)}</span>
      </div>
    ) : null

  return (
    <CollapsibleCode
      title={renderFileNameComponent() || language}
      actions={renderActions()}
      className={className}
      isLoading={isLoading}
      defaultExpanded={defaultExpanded}
    >
      <div style={style}>{parse(highlightedCode)}</div>
    </CollapsibleCode>
  )
}

const getRangeFromCode = (
  code: string
): {
  startLine: number | undefined
  endLine: number | undefined
} => {
  const lines = code.trim().split('\n')
  let startLine: number | undefined
  let endLine: number | undefined

  for (const line of lines) {
    const trimmedLine = line.trim()

    const parseLineNumber = (prefix: string): number | undefined => {
      if (trimmedLine.startsWith(prefix)) {
        const value = trimmedLine.slice(prefix.length).trim()
        const parsed = parseInt(value, 10)
        return !Number.isNaN(parsed) && parsed > 0 ? parsed : undefined
      }
      return undefined
    }

    const parsedStartLine = parseLineNumber('startLine:')
    if (parsedStartLine !== undefined) {
      startLine = parsedStartLine
    }

    const parsedEndLine = parseLineNumber('endLine:')
    if (parsedEndLine !== undefined) {
      endLine = parsedEndLine
    }

    // stop the loop if both values are found
    if (startLine !== undefined && endLine !== undefined) {
      break
    }
  }

  // ensure endLine is greater than or equal to startLine
  if (startLine !== undefined && endLine !== undefined && endLine < startLine) {
    ;[startLine, endLine] = [endLine, startLine]
  }

  return { startLine, endLine }
}
