import React, { useEffect, useRef, type CSSProperties, type FC } from 'react'
import { AnimatedList } from '@webview/components/ui/animated-list'
import type { ConversationWithUIState } from '@webview/types/chat'
import { cn } from '@webview/utils/common'

import { ChatAIMessage, type ChatAIMessageProps } from './roles/chat-ai-message'
import {
  ChatHumanMessage,
  type ChatHumanMessageProps
} from './roles/chat-human-message'

interface ChatMessagesProps
  extends Pick<
    InnerMessageProps,
    | 'context'
    | 'setContext'
    | 'onEditModeChange'
    | 'onSend'
    | 'className'
    | 'style'
  > {
  conversationsWithUIState: ConversationWithUIState[]
}

export const ChatMessages: React.FC<ChatMessagesProps> = props => {
  const {
    conversationsWithUIState,
    context,
    setContext,
    onSend,
    onEditModeChange,
    className,
    style
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const prevConversationLengthRef = useRef(conversationsWithUIState.length)

  useEffect(() => {
    if (!containerRef.current) return

    // only scroll to bottom if new messages are added
    const currentLength = conversationsWithUIState.length
    const prevLength = prevConversationLengthRef.current

    if (currentLength > prevLength) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }

    prevConversationLengthRef.current = currentLength
  }, [conversationsWithUIState.length])

  // const handleSetConversation: Updater<Conversation> = (
  //   conversationOrUpdater: Conversation | DraftFunction<Conversation>
  // ) => {
  //   setContext((draft: ChatContext) => {
  //     const index = draft.conversations.findIndex(c => {
  //       if (typeof conversationOrUpdater === 'function') {
  //         // Create a temporary draft to test the updater
  //         const tempC = produce(c, conversationOrUpdater)
  //         // Compare IDs to find the right conversation
  //         return tempC.id === c.id && tempC !== c
  //       }
  //       return c.id === conversationOrUpdater.id
  //     })

  //     if (index !== -1) {
  //       if (typeof conversationOrUpdater === 'function') {
  //         // Apply the updater function to the found conversation
  //         conversationOrUpdater(draft.conversations[index]!)
  //       } else {
  //         // Replace the conversation with the new one
  //         draft.conversations[index] = conversationOrUpdater
  //       }
  //     }
  //   })
  // }

  return (
    <div
      ref={containerRef}
      className={cn(
        'chat-messages flex-1 flex flex-col w-full overflow-y-auto gap-2 pt-4',
        className
      )}
      style={style}
    >
      {/* Chat messages */}
      <AnimatedList>
        {conversationsWithUIState.map(conversationWithUIState => {
          const { uiState, ...conversation } = conversationWithUIState
          return (
            <InnerMessage
              key={conversation.id}
              conversation={conversation}
              context={context}
              setContext={setContext}
              onSend={onSend}
              isEditMode={uiState.isEditMode}
              isLoading={uiState.isLoading}
              sendButtonDisabled={uiState.sendButtonDisabled}
              onEditModeChange={onEditModeChange}
            />
          )
        })}
      </AnimatedList>
    </div>
  )
}

interface InnerMessageProps extends ChatAIMessageProps, ChatHumanMessageProps {
  className?: string
  style?: CSSProperties
}

const InnerMessage: FC<InnerMessageProps> = props => {
  const {
    context,
    setContext,
    conversation,
    onSend,
    isLoading,
    isEditMode,
    sendButtonDisabled,
    onEditModeChange,
    className,
    style
  } = props

  return (
    <div
      key={conversation.id}
      className={cn(
        'flex relative max-w-full w-full items-center mb-2',
        className
      )}
      style={style}
    >
      {conversation.role === 'ai' && (
        <ChatAIMessage
          conversation={conversation}
          isLoading={isLoading}
          isEditMode={isEditMode}
          onEditModeChange={onEditModeChange}
        />
      )}

      {conversation.role === 'human' && (
        <ChatHumanMessage
          context={context}
          setContext={setContext}
          conversation={conversation}
          onSend={onSend}
          isLoading={isLoading}
          isEditMode={isEditMode}
          sendButtonDisabled={sendButtonDisabled}
          onEditModeChange={onEditModeChange}
        />
      )}
    </div>
  )
}
