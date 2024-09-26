import { useRef, type FC } from 'react'
import { GearIcon, PlusIcon } from '@radix-ui/react-icons'
import { useChatState } from '@webview/hooks/chat/use-chat-state'
import { api } from '@webview/services/api-client'
import type { Conversation } from '@webview/types/chat'
import { useNavigate } from 'react-router'

import { ButtonWithTooltip } from '../button-with-tooltip'
import { GlowingCard } from '../glowing-card'
import { SidebarLayout } from '../sidebar-layout'
import { ChatInput, type ChatInputRef } from './editor/chat-input'
import { ChatMessages } from './messages/chat-messages'
import { ChatSidebar } from './sidebar/chat-sidebar'

export const ChatUI: FC = () => {
  const navigate = useNavigate()
  const {
    context,
    setContext,
    newConversation,
    setNewConversation,
    resetNewConversation,
    historiesConversationsWithUIState,
    newConversationUIState,
    replaceConversationAndTruncate,
    setUIStateForSending,
    resetUIStateAfterSending,
    setConversationEditMode
  } = useChatState()

  const chatInputRef = useRef<ChatInputRef>(null)

  const resetNewConversationInput = () => {
    resetNewConversation()
    chatInputRef.current?.resetEditor()
  }

  const handleSend = async (conversation: Conversation) => {
    try {
      const updatedContext = await replaceConversationAndTruncate(conversation)
      setUIStateForSending(conversation.id)

      await api.chat.streamChat(
        {
          chatContext: updatedContext
        },
        (conversations: Conversation[]) => {
          console.log('Received conversations:', conversations)
          setContext(draft => {
            draft.conversations = conversations
          })
        }
      )

      setConversationEditMode(conversation.id, false)

      if (conversation.id === newConversation.id) {
        resetNewConversationInput()
      }

      chatInputRef.current?.focusOnEditor()
    } finally {
      resetUIStateAfterSending(conversation.id)
    }
  }

  const handleEditModeChange = (
    isEditMode: boolean,
    conversation: Conversation
  ) => {
    setConversationEditMode(conversation.id, isEditMode)
  }

  return (
    <SidebarLayout
      title="Chat"
      sidebar={<ChatSidebar />}
      headerLeft={
        <>
          <ButtonWithTooltip
            variant="ghost"
            size="iconXs"
            tooltip="New Chat"
            side="bottom"
            className="shrink-0"
          >
            <PlusIcon className="size-3" />
          </ButtonWithTooltip>
          <ButtonWithTooltip
            variant="ghost"
            size="iconXs"
            tooltip="Settings"
            side="bottom"
            className="shrink-0"
            onClick={() => {
              navigate('/settings')
            }}
          >
            <GearIcon className="size-3" />
          </ButtonWithTooltip>
        </>
      }
      className="chat-ui"
    >
      <ChatMessages
        conversationsWithUIState={historiesConversationsWithUIState}
        context={context}
        setContext={setContext}
        onSend={handleSend}
        onEditModeChange={handleEditModeChange}
      />

      <GlowingCard isAnimated={newConversationUIState.isLoading}>
        <ChatInput
          ref={chatInputRef}
          autoFocus
          context={context}
          setContext={setContext}
          conversation={newConversation}
          setConversation={setNewConversation}
          sendButtonDisabled={
            newConversationUIState.isLoading ??
            newConversationUIState.sendButtonDisabled ??
            false
          }
          onSend={handleSend}
        />
      </GlowingCard>
    </SidebarLayout>
  )
}
