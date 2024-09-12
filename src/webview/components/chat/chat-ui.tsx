import { useRef, type FC } from 'react'
import { useChatState } from '@webview/hooks/chat/use-chat-state'
import { ChatService } from '@webview/services/chat-service'
import type { Conversation } from '@webview/types/chat'

import { GlowingCard } from '../glowing-card'
import { SidebarLayout } from '../sidebar-layout'
import { ChatInput, type ChatInputRef } from './editor/chat-input'
import { ChatHeader } from './header/chat-header'
import { ChatMessages } from './messages/chat-messages'
import { ChatSidebar } from './sidebar/chat-sidebar'

export const ChatUI: FC = () => {
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
      replaceConversationAndTruncate(conversation)
      setUIStateForSending(conversation.id)

      await ChatService.sendConversations(context)

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
      sidebar={<ChatSidebar />}
      buildHeader={SidebarHamburger => (
        <ChatHeader headerLeft={<SidebarHamburger />} />
      )}
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
