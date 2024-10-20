import { useEffect, useRef, type CSSProperties, type FC } from 'react'
import {
  ChatInput,
  ChatInputMode,
  type ChatInputProps,
  type ChatInputRef
} from '@webview/components/chat/editor/chat-input'
import { GlowingCard } from '@webview/components/glowing-card'
import { useConversation } from '@webview/hooks/chat/use-conversation'
import type { Conversation, ConversationUIState } from '@webview/types/chat'
import { cn } from '@webview/utils/common'

export interface ChatHumanMessageProps
  extends Pick<
      ChatInputProps,
      'context' | 'setContext' | 'conversation' | 'onSend'
    >,
    ConversationUIState {
  className?: string
  style?: CSSProperties
  onEditModeChange?: (isEditMode: boolean, conversation: Conversation) => void
}

export const ChatHumanMessage: FC<ChatHumanMessageProps> = props => {
  const {
    isLoading,
    isEditMode = false,
    sendButtonDisabled,
    onEditModeChange,
    context,
    setContext,
    conversation: initialConversation,
    onSend,
    className,
    style
  } = props
  const chatInputRef = useRef<ChatInputRef>(null)

  const { conversation, setConversation } = useConversation(
    'human',
    initialConversation
  )

  const handleSend = () => {
    onSend(conversation)
  }

  useEffect(() => {
    if (isEditMode) {
      // i don't know why this is needed
      setTimeout(() => {
        chatInputRef.current?.focusOnEditor(true)
      }, 0)
    }
  }, [isEditMode])

  return (
    <div className="w-full flex">
      <div className="w-4 shrink-0" />
      <div
        className={cn(
          'mr-4 ml-auto bg-background text-foreground border rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl overflow-hidden',
          isEditMode && 'w-full',
          className
        )}
        style={style}
        onClick={() => {
          if (isEditMode) return
          onEditModeChange?.(true, conversation)
        }}
      >
        <GlowingCard isAnimated={isLoading}>
          <ChatInput
            ref={chatInputRef}
            mode={
              isEditMode
                ? ChatInputMode.MessageEdit
                : ChatInputMode.MessageReadonly
            }
            context={context}
            setContext={setContext}
            conversation={conversation}
            setConversation={setConversation}
            sendButtonDisabled={isLoading ?? sendButtonDisabled ?? false}
            onSend={handleSend}
          />
        </GlowingCard>
      </div>
    </div>
  )
}
