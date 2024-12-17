import { FC, type ReactNode } from 'react'
import { LightningBoltIcon } from '@radix-ui/react-icons'
import type { Conversation, ConversationLog } from '@shared/entities'
import { toLogWithAgent } from '@shared/plugins/base/base-to-state'
import { Card } from '@webview/components/ui/card'
import { ShineBorder } from '@webview/components/ui/shine-border'
import {
  SplitAccordion,
  SplitAccordionContent,
  SplitAccordionTrigger
} from '@webview/components/ui/split-accordion'
import { usePluginCustomRenderLogPreview } from '@webview/hooks/chat/use-plugin-providers'
import { cn } from '@webview/utils/common'

import { Markdown } from '../markdown'

export const ChatLogPreview: FC<{
  className?: string
  log: ConversationLog
  children?: ReactNode
}> = ({ log, className, children }) => (
  <Card
    className={cn(
      'relative overflow-hidden bg-muted/50 hover:bg-muted/80 transition-colors',
      className
    )}
  >
    <div className="flex-1 p-2">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-medium text-md truncate">{log.title}</h4>
      </div>

      {log.content && (
        <div
          className={cn(
            'text-sm text-muted-foreground border my-2 p-2 rounded-md'
          )}
        >
          <Markdown
            variant="chat"
            className="prose-sm"
            fontSize={12}
            lineHeight={1.5}
          >
            {log.content}
          </Markdown>
        </div>
      )}

      {children}
    </div>
  </Card>
)

export const ChatAIMessageLogPreview: FC<{ conversation: Conversation }> = ({
  conversation
}) => {
  const logs = toLogWithAgent(conversation)

  const customRenderLogPreview = usePluginCustomRenderLogPreview()

  if (logs.length === 0) return null

  return (
    <div className="mt-2 space-y-2">
      {logs.map((log, index) => (
        <div key={index}>
          {log.agent && customRenderLogPreview ? (
            customRenderLogPreview({ log })
          ) : (
            <ChatLogPreview log={log} />
          )}
        </div>
      ))}
    </div>
  )
}

export const ChatAIMessageLogAccordion: FC<{
  conversation: Conversation
  isLoading: boolean
}> = ({ conversation, isLoading }) => {
  if (!conversation.logs.length) return null

  const getAccordionTriggerTitle = () => {
    if (!isLoading) return 'Thought'

    if (conversation.logs.length > 0)
      return conversation.logs.at(-1)?.title || 'Thinking...'

    return 'Thinking...'
  }

  return (
    <SplitAccordion>
      <ShineBorder
        color={['hsl(var(--foreground))', 'hsl(var(--border))']}
        borderRadius={6}
        duration={5}
        animated={isLoading}
      >
        <SplitAccordionTrigger
          value="log"
          variant="outline"
          size="sm"
          iconClassName="size-3"
          className="border-none"
        >
          <LightningBoltIcon className="size-3" />
          <span className="select-none">{getAccordionTriggerTitle()}</span>
        </SplitAccordionTrigger>
      </ShineBorder>
      <SplitAccordionContent value="log" className="mt-2">
        <ChatAIMessageLogPreview conversation={conversation} />
      </SplitAccordionContent>
    </SplitAccordion>
  )
}
