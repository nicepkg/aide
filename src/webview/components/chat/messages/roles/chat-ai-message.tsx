import type { CSSProperties, FC } from 'react'
import { getAllTextFromLangchainMessageContents } from '@shared/utils/get-all-text-from-langchain-message-contents'
import { GlowingCard } from '@webview/components/glowing-card'
import type { Conversation, ConversationUIState } from '@webview/types/chat'
import { cn } from '@webview/utils/common'

import { Markdown } from '../markdown'

export interface ChatAIMessageProps extends ConversationUIState {
  className?: string
  style?: CSSProperties
  conversation: Conversation
  onEditModeChange?: (isEditMode: boolean, conversation: Conversation) => void
}

export const ChatAIMessage: FC<ChatAIMessageProps> = props => {
  const {
    conversation,
    isLoading,
    className,
    style,
    isEditMode = false,
    onEditModeChange
  } = props
  return (
    <div className="w-full flex">
      <div
        className={cn(
          'ml-4 mr-auto bg-background text-foreground border rounded-tl-2xl rounded-br-2xl rounded-tr-2xl overflow-hidden',
          isEditMode && 'w-full',
          className
        )}
        style={style}
        onClick={() => {
          if (isEditMode) return
          console.log('edit mode', onEditModeChange)
          // onEditModeChange?.(true, conversation)
        }}
      >
        <GlowingCard isAnimated={isLoading}>
          {/* {conversation.content} */}
          <Markdown
            variant="chat"
            className={cn('px-2', !conversation.contents && 'opacity-50')}
          >
            {getAllTextFromLangchainMessageContents(conversation.contents)}
          </Markdown>
        </GlowingCard>
      </div>
      <div className="w-4 shrink-0" />
    </div>
  )
}
