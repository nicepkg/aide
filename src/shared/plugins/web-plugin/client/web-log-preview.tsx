import { FC } from 'react'
import { GlobeIcon } from '@radix-ui/react-icons'
import type { ConversationLog } from '@shared/entities'
import { PluginId } from '@shared/plugins/base/types'
import type { PreviewContent } from '@webview/components/chat/editor/content-preview'
import { ContentPreviewPopover } from '@webview/components/chat/editor/content-preview-popover'
import { ChatLogPreview } from '@webview/components/chat/messages/roles/chat-log-preview'
import { cn } from '@webview/utils/common'

import type { WebDocInfo, WebPluginLog } from '../types'

export const WebLogPreview: FC<{
  log: ConversationLog
}> = props => {
  if (props.log.pluginId !== PluginId.Web) return null
  const log = props.log as WebPluginLog

  return (
    <ChatLogPreview log={log}>
      <div className="mt-2">
        {/* Search Results Section */}
        {log.webSearchResultsFromAgent?.map((doc, index) => (
          <WebDocItem
            key={`search-${index}`}
            doc={doc}
            className={cn(index !== 0 && 'border-t')}
          />
        ))}

        {/* Visit Results Section */}
        {log.webVisitResultsFromAgent?.map((doc, index) => (
          <WebDocItem
            key={`visit-${index}`}
            doc={doc}
            className={cn(
              index !== 0 && 'border-t',
              log.webSearchResultsFromAgent?.length && 'border-t'
            )}
          />
        ))}
      </div>
    </ChatLogPreview>
  )
}

interface WebDocItemProps {
  doc: WebDocInfo
  className?: string
}

const WebDocItem: FC<WebDocItemProps> = ({ doc, className }) => {
  const previewContent: PreviewContent = {
    type: 'markdown',
    content: doc.content
  }

  const handleOpenUrl = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(doc.url, '_blank')
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
            <GlobeIcon className="size-4 text-foreground/70" />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Content Preview */}
          <div className="mb-1 line-clamp-1 text-sm text-foreground">
            {doc.content}
          </div>

          {/* URL */}
          <div
            onClick={handleOpenUrl}
            className="truncate text-xs font-medium text-foreground/70 hover:text-primary cursor-pointer"
          >
            {doc.url}
          </div>
        </div>
      </div>
    </ContentPreviewPopover>
  )
}
