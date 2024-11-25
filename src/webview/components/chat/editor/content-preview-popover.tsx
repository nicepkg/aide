import React, { useMemo } from 'react'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@webview/components/ui/popover'
import { SparklesText } from '@webview/components/ui/sparkles-text'
import { useGlobalContext } from '@webview/contexts/global-context'
import { useReadFile } from '@webview/hooks/api/use-read-file'
import { useControllableState } from '@webview/hooks/use-controllable-state'
import { getExtFromPath } from '@webview/utils/path'
import { getShikiLanguageFromPath } from '@webview/utils/shiki'
import ShikiHighlighter from 'react-shiki'

import { Markdown } from '../messages/markdown'

export type PreviewContent =
  | { type: 'text'; content: string }
  | { type: 'markdown'; content: string }
  | { type: 'image'; url: string }
  | { type: 'file'; path: string }

const FILE_TYPE_MAP = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico'],
  markdown: ['md', 'markdown'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
} as const

interface ContentPreviewPopoverProps {
  content: PreviewContent
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export const ContentPreviewPopover: React.FC<ContentPreviewPopoverProps> = ({
  content,
  open,
  onOpenChange,
  children
}) => {
  const [isOpen, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: false,
    onChange: onOpenChange
  })
  const { isDarkTheme } = useGlobalContext()

  const getFileType = (filePath: string) => {
    const ext = getExtFromPath(filePath)?.toLowerCase() || 'txt'

    for (const [type, extensions] of Object.entries(FILE_TYPE_MAP)) {
      if ((extensions as unknown as string[]).includes(ext)) {
        return type
      }
    }
    return 'text'
  }

  const { data: fileContent = '' } = useReadFile(
    content.type === 'file' ? content.path : '',
    content.type === 'file' &&
      (getFileType(content.path) === 'document' ||
        getFileType(content.path) === 'image')
      ? 'base64'
      : 'utf-8'
  )

  const renderFilePreview = useMemo(() => {
    if (content.type !== 'file') return null

    const fileType = getFileType(content.path)
    const ext = getExtFromPath(content.path)

    switch (fileType) {
      case 'image':
        return (
          <img
            src={
              fileContent
                ? `data:image/${ext};base64,${fileContent}`
                : content.path
            }
            alt="Preview"
            className="max-w-full max-h-[500px] object-contain"
          />
        )

      case 'markdown':
        return <Markdown>{fileContent}</Markdown>

      case 'document':
        const blobUrl = fileContent
          ? URL.createObjectURL(
              new Blob([Buffer.from(fileContent, 'base64')], {
                type: `application/${ext}`
              })
            )
          : content.path

        return (
          <DocViewer
            documents={[{ uri: blobUrl }]}
            pluginRenderers={DocViewerRenderers}
            style={{ width: '100%', height: '450px' }}
            config={{
              header: {
                disableHeader: true,
                disableFileName: true
              },
              pdfZoom: {
                defaultZoom: 1.1,
                zoomJump: 0.2
              },
              loadingRenderer: {
                overrideComponent: () => (
                  <div className="h-full w-full flex items-center justify-center">
                    <SparklesText text="AIDE" />
                  </div>
                )
              }
            }}
          />
        )

      default:
        return (
          <ShikiHighlighter
            language={getShikiLanguageFromPath(content.path)}
            theme={isDarkTheme ? 'dark-plus' : 'light-plus'}
            addDefaultStyles={false}
          >
            {fileContent}
          </ShikiHighlighter>
        )
    }
  }, [content, fileContent])

  const renderContent = () => {
    switch (content.type) {
      case 'text':
        return (
          <div className="whitespace-pre-wrap font-mono text-sm">
            {content.content}
          </div>
        )

      case 'markdown':
        return <Markdown>{content.content}</Markdown>

      case 'image':
        return (
          <img
            src={content.url}
            alt="Preview"
            className="max-w-full max-h-[500px] object-contain"
          />
        )

      case 'file':
        return renderFilePreview

      default:
        return null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const allowedKeys = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown'
    ]
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault()
    }
  }

  const preventDefault = (e: React.SyntheticEvent) => {
    e.preventDefault()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="min-w-[200px] max-w-[800px] w-screen max-h-[500px] p-0 border-primary"
        side="top"
        align="start"
        onCloseAutoFocus={e => e.preventDefault()}
      >
        <div
          className="w-full p-4 bg-background overflow-auto"
          contentEditable
          suppressContentEditableWarning
          onInput={preventDefault}
          onKeyDown={handleKeyDown}
          onCopy={preventDefault}
          onPaste={preventDefault}
          onDragStart={preventDefault}
          onDrop={preventDefault}
          style={{ cursor: 'text' }}
        >
          {renderContent()}
        </div>
      </PopoverContent>
    </Popover>
  )
}
