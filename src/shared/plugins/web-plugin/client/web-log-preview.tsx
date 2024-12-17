import { FC, type ReactNode } from 'react'
import { GlobeIcon } from '@radix-ui/react-icons'
import {
  webSearchAgentName,
  webVisitAgentName
} from '@shared/plugins/agents/agent-names'
import type { WebSearchAgent } from '@shared/plugins/agents/web-search-agent'
import type { WebVisitAgent } from '@shared/plugins/agents/web-visit-agent'
import type { CustomRenderLogPreviewProps } from '@shared/plugins/base/client/client-plugin-types'
import type { GetAgent } from '@shared/plugins/base/strategies'
import { ChatLogPreview } from '@webview/components/chat/messages/roles/chat-log-preview'
import type { PreviewContent } from '@webview/components/content-preview'
import { ContentPreviewPopover } from '@webview/components/content-preview-popover'
import { cn } from '@webview/utils/common'

import type { WebDocInfo } from '../types'

export const WebLogPreview: FC<CustomRenderLogPreviewProps> = props => {
  const { log } = props
  const { agent } = log

  const renderWrapper = (children: ReactNode) => (
    <ChatLogPreview log={log}>
      <div className="mt-2">{children}</div>
    </ChatLogPreview>
  )

  if (!agent) return null

  switch (agent.name) {
    case webSearchAgentName:
      return renderWrapper(
        (agent as GetAgent<WebSearchAgent>).output.webSearchResults?.map(
          (doc, index) => (
            <WebDocItem
              key={`search-${index}`}
              doc={doc}
              className={cn(index !== 0 && 'border-t')}
            />
          )
        )
      )
    case webVisitAgentName:
      return renderWrapper(
        (agent as GetAgent<WebVisitAgent>).output.contents?.map(
          (doc, index) => (
            <WebDocItem
              key={`visit-${index}`}
              doc={doc}
              className={cn(index !== 0 && 'border-t')}
            />
          )
        )
      )
    default:
      return null
  }
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
