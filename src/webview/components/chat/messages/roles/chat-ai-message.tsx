import type { CSSProperties, FC } from 'react'
import { GlowingCard } from '@webview/components/glowing-card'
import type { Conversation, ConversationUIState } from '@webview/types/chat'
import { cn } from '@webview/utils/common'

export interface ChatAIMessageProps extends ConversationUIState {
  className?: string
  style?: CSSProperties
  conversation: Conversation
  onEditModeChange?: (isEditMode: boolean, conversation: Conversation) => void
}

export const ChatAIMessage: FC<ChatAIMessageProps> = props => {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { conversation, isLoading, className, style, onEditModeChange } = props
  return (
    <GlowingCard
      isAnimated={isLoading}
      className={cn('w-full px-4', className)}
      style={style}
    >
      <div className="bg-background text-foreground w-full">
        {conversation.content}
      </div>
    </GlowingCard>
  )
}
