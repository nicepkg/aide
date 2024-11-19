import { FC } from 'react'
import { FileTextIcon } from '@radix-ui/react-icons'
import type { ConversationLog } from '@shared/entities'
import { PluginId } from '@shared/plugins/base/types'
import {
  ContentPreviewPopover,
  PreviewContent
} from '@webview/components/chat/editor/content-preview-popover'
import { ChatLogPreview } from '@webview/components/chat/messages/roles/chat-log-preview'
import { api } from '@webview/services/api-client'
import { cn } from '@webview/utils/common'

import type { DocInfo, DocPluginLog } from '../types'

export const DocLogPreview: FC<{
  log: ConversationLog
}> = props => {
  if (props.log.pluginId !== PluginId.Doc) return null
  const log = props.log as DocPluginLog

  return (
    <ChatLogPreview log={log}>
      <div className="mt-2">
        {log.relevantDocsFromAgent?.map((doc, index) => (
          <DocItem
            key={index}
            doc={doc}
            className={cn(index !== 0 && 'border-t')}
          />
        ))}
      </div>
    </ChatLogPreview>
  )
}

interface DocItemProps {
  doc: DocInfo
  className?: string
}

const DocItem: FC<DocItemProps> = ({ doc, className }) => {
  const previewContent: PreviewContent = {
    type: 'markdown',
    content: doc.content
  }

  const handleOpenPath = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!doc.path) return

    // if path is a url, open it in the browser
    if (doc.path.startsWith('http')) {
      window.open(doc.path, '_blank')
    } else {
      // if path is a local file, open it in the editor
      await api.file.openFileInEditor({
        path: doc.path
      })
    }
  }

  return (
    <ContentPreviewPopover content={previewContent}>
      <div
        className={cn(
          'group flex items-center gap-2 p-2 rounded-md',
          'hover:bg-accent cursor-pointer transition-all duration-200',
          className
        )}
      >
        <div className="flex-shrink-0">
          <div className="flex size-8 items-center justify-center rounded-md border">
            <FileTextIcon className="size-4 text-foreground/70" />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Content Preview */}
          <div className="mb-1 line-clamp-1 text-sm text-foreground">
            {doc.content}
          </div>

          {/* Path */}
          <div
            onClick={handleOpenPath}
            className="truncate text-xs font-medium text-foreground/70 hover:text-primary cursor-pointer"
          >
            {doc.path}
          </div>
        </div>
      </div>
    </ContentPreviewPopover>
  )
}
