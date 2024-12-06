import React, {
  useEffect,
  useRef,
  type CSSProperties,
  type FC,
  type RefObject
} from 'react'
import { getAllTextFromLangchainMessageContents } from '@shared/utils/get-all-text-from-langchain-message-contents'
import { AnimatedList } from '@webview/components/ui/animated-list'
import { ScrollArea } from '@webview/components/ui/scroll-area'
import type { ConversationWithUIState } from '@webview/types/chat'
import { cn, copyToClipboard } from '@webview/utils/common'
import scrollIntoView from 'scroll-into-view-if-needed'

import { ChatAIMessage, type ChatAIMessageProps } from './roles/chat-ai-message'
import {
  ChatHumanMessage,
  type ChatHumanMessageProps,
  type ChatHumanMessageRef
} from './roles/chat-human-message'
import {
  MessageToolbar,
  type MessageToolbarEvents
} from './toolbars/message-toolbars'

interface ChatMessagesProps
  extends Pick<
    InnerMessageProps,
    | 'context'
    | 'setContext'
    | 'onEditModeChange'
    | 'onSend'
    | 'className'
    | 'style'
    | 'onDelete'
    | 'onRegenerate'
  > {
  conversationsWithUIState: ConversationWithUIState[]
  autoScrollToBottom?: boolean
  disableAnimation?: boolean
}

export const ChatMessages: React.FC<ChatMessagesProps> = props => {
  const {
    conversationsWithUIState,
    context,
    setContext,
    onSend,
    onEditModeChange,
    className,
    style,
    onDelete,
    onRegenerate,
    autoScrollToBottom = true,
    disableAnimation = false
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContentRef = useRef<HTMLDivElement>(null)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)
  const prevConversationIdRef = useRef<string>(undefined)

  const lastConversationId = conversationsWithUIState.at(-1)?.id

  useEffect(() => {
    if (!containerRef.current) return

    const currentId = lastConversationId
    const prevId = prevConversationIdRef.current

    if (currentId !== prevId && currentId && autoScrollToBottom) {
      const endOfMessagesElement = endOfMessagesRef.current
      if (endOfMessagesElement) {
        setTimeout(() => {
          scrollIntoView(endOfMessagesElement, {
            scrollMode: 'if-needed',
            block: 'end'
          })
        }, 100)
      }
    }

    prevConversationIdRef.current = lastConversationId
  }, [lastConversationId, autoScrollToBottom])

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
    <ScrollArea
      ref={containerRef}
      className={cn(
        'chat-messages flex-1 flex flex-col w-full overflow-y-auto gap-2 pt-4',
        className
      )}
      viewPortProps={{ ref: scrollContentRef }}
      style={style}
    >
      <style>
        {`
        .chat-messages [data-radix-scroll-area-viewport] > div {
            display:block !important;
            width: 100%;
        }
        `}
      </style>

      {/* Chat messages */}
      <AnimatedList disableAnimation={disableAnimation}>
        {conversationsWithUIState.map(conversationWithUIState => {
          const { uiState, ...conversation } = conversationWithUIState
          return (
            <InnerMessage
              key={conversation.id}
              scrollContentRef={scrollContentRef}
              conversation={conversation}
              context={context}
              setContext={setContext}
              onSend={onSend}
              isEditMode={uiState.isEditMode}
              isLoading={uiState.isLoading}
              sendButtonDisabled={uiState.sendButtonDisabled}
              onEditModeChange={onEditModeChange}
              onDelete={onDelete}
              onRegenerate={onRegenerate}
            />
          )
        })}
      </AnimatedList>
      <div ref={endOfMessagesRef} className="w-full h-2" />
    </ScrollArea>
  )
}

interface InnerMessageProps
  extends ChatAIMessageProps,
    Omit<ChatHumanMessageProps, 'ref'>,
    Pick<MessageToolbarEvents, 'onDelete' | 'onRegenerate'> {
  className?: string
  style?: CSSProperties
  scrollContentRef: RefObject<HTMLElement | null>
}

const InnerMessage: FC<InnerMessageProps> = props => {
  const messageRef = useRef<ChatHumanMessageRef>(null)
  const {
    conversation,
    onEditModeChange,
    context,
    setContext,
    onSend,
    isLoading,
    isEditMode,
    sendButtonDisabled,
    className,
    style,
    scrollContentRef,
    onDelete,
    onRegenerate
  } = props

  const isAiMessage = conversation.role === 'ai'
  const isHumanMessage = conversation.role === 'human'

  const handleCopy = () => {
    if (isHumanMessage) {
      messageRef.current?.copy?.()
    }

    if (isAiMessage) {
      copyToClipboard(
        getAllTextFromLangchainMessageContents(conversation.contents)
      )
    }
  }

  const renderMessageToolbar = () => (
    <MessageToolbar
      conversation={conversation}
      scrollContentRef={scrollContentRef}
      messageRef={messageRef}
      onEdit={
        isHumanMessage
          ? () => onEditModeChange?.(true, conversation)
          : undefined
      }
      onCopy={handleCopy}
      onDelete={onDelete}
      onRegenerate={isAiMessage ? onRegenerate : undefined}
    />
  )

  return (
    <div
      key={conversation.id}
      className={cn(
        'flex flex-col relative max-w-full w-full items-start px-4',
        conversation.role === 'human' && 'items-end',
        className
      )}
      style={style}
    >
      {isAiMessage && (
        <>
          <ChatAIMessage
            ref={messageRef}
            conversation={conversation}
            isLoading={isLoading}
            isEditMode={isEditMode}
            // onEditModeChange={onEditModeChange}
          />
          {renderMessageToolbar()}
        </>
      )}

      {isHumanMessage && (
        <>
          <ChatHumanMessage
            ref={messageRef}
            context={context}
            setContext={setContext}
            conversation={conversation}
            onSend={onSend}
            isLoading={isLoading}
            isEditMode={isEditMode}
            sendButtonDisabled={sendButtonDisabled}
            onEditModeChange={onEditModeChange}
          />
          {renderMessageToolbar()}
        </>
      )}
    </div>
  )
}
