import React from 'react'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import { HighlightedCode } from '@webview/components/chat/messages/markdown/highlighter/highlighter'
import { QueryStateWrapper } from '@webview/components/query-state-wrapper'
import { SparklesText } from '@webview/components/ui/sparkles-text'
import { useReadFile } from '@webview/hooks/api/use-read-file'
import { getExtFromPath } from '@webview/utils/path'
import { getShikiLanguageFromPath } from '@webview/utils/shiki'

import { Markdown } from './chat/messages/markdown'

export type PreviewContent =
  | { type: 'text'; content: string }
  | { type: 'markdown'; content: string }
  | { type: 'image'; url: string }
  | { type: 'file'; path: string; content?: string }

const FILE_TYPE_MAP = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico'],
  markdown: ['md', 'markdown'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
} as const

interface ContentPreviewProps {
  content: PreviewContent
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({ content }) => {
  const getFileType = (filePath: string) => {
    const ext = getExtFromPath(filePath)?.toLowerCase() || 'txt'

    for (const [type, extensions] of Object.entries(FILE_TYPE_MAP)) {
      if ((extensions as unknown as string[]).includes(ext)) {
        return type
      }
    }
    return 'text'
  }

  const { data: fileContent = '', isPending: isLoading } = useReadFile({
    filePath: content.type === 'file' ? content.path : '',
    content: content.type === 'file' ? content.content : undefined,
    encoding:
      content.type === 'file' &&
      (getFileType(content.path) === 'document' ||
        getFileType(content.path) === 'image')
        ? 'base64'
        : 'utf-8'
  })

  const renderFilePreview = () => {
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
            className="max-w-full max-h-[500px] w-full h-full object-contain"
          />
        )

      case 'markdown':
        return <Markdown className="p-4">{fileContent}</Markdown>

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
            className="p-4"
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
          <HighlightedCode language={getShikiLanguageFromPath(content.path)}>
            {fileContent}
          </HighlightedCode>
        )
    }
  }

  switch (content.type) {
    case 'text':
      return (
        <div className="whitespace-pre-wrap font-mono text-sm p-4">
          {content.content}
        </div>
      )

    case 'markdown':
      return <Markdown className="p-4">{content.content}</Markdown>

    case 'image':
      return (
        <img
          src={content.url}
          alt="Preview"
          className="max-w-full max-h-[500px] w-full h-full object-contain"
        />
      )

    case 'file':
      return (
        <QueryStateWrapper
          isLoading={isLoading}
          isEmpty={!fileContent}
          emptyMessage="Empty file"
        >
          {renderFilePreview()}
        </QueryStateWrapper>
      )

    default:
      return null
  }
}
