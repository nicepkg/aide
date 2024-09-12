import type { Conversation } from '@webview/types/chat'

import { useChatContextManager } from './use-chat-context-manager'
import { useConversation } from './use-conversation'
import { useConversationsWithUIState } from './use-conversations-with-ui-state'

export const useChatState = () => {
  const { context, setContext } = useChatContextManager()
  const {
    conversation: newConversation,
    setConversation: setNewConversation,
    resetConversation: resetNewConversation
  } = useConversation('human')

  const allConversations = [...context.conversations, newConversation]

  const {
    conversationsWithUIState,
    getConversationUIState,
    setConversationUIState,
    setAllConversationsUIState
  } = useConversationsWithUIState({
    conversations: allConversations
  })

  const historiesConversationsWithUIState = conversationsWithUIState.filter(
    c => c.id !== newConversation.id
  )

  const newConversationUIState = getConversationUIState(newConversation.id)

  const replaceConversationAndTruncate = (conversation: Conversation) => {
    setContext(draft => {
      const index = draft.conversations.findIndex(c => c.id === conversation.id)

      // delete current conversation and all conversations after it
      index !== -1 && draft.conversations.splice(index)

      // add new conversation
      draft.conversations.push(conversation)
    })
  }

  const setUIStateForSending = (conversationId: string) => {
    setAllConversationsUIState({ sendButtonDisabled: true })
    setConversationUIState(conversationId, { isLoading: true })
  }

  const resetUIStateAfterSending = (conversationId: string) => {
    setAllConversationsUIState({ sendButtonDisabled: false })
    setConversationUIState(conversationId, {
      isLoading: false,
      isEditMode: false
    })
  }

  const setConversationEditMode = (
    conversationId: string,
    isEditMode: boolean
  ) => {
    if (!isEditMode) {
      setConversationUIState(conversationId, { isEditMode: false })
    } else {
      setAllConversationsUIState({ isEditMode: false })
      setConversationUIState(conversationId, { isEditMode: true })
    }
  }

  return {
    context,
    setContext,
    newConversation,
    setNewConversation,
    resetNewConversation,
    conversationsWithUIState,
    historiesConversationsWithUIState,
    newConversationUIState,
    replaceConversationAndTruncate,
    setUIStateForSending,
    resetUIStateAfterSending,
    setConversationEditMode
  }
}
