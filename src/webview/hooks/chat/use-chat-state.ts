import { useMemo } from 'react'
import type { Conversation } from '@shared/types/chat-context'
import { useChatContext } from '@webview/contexts/chat-context'
import type { ConversationUIState } from '@webview/types/chat'
import type { DraftFunction } from 'use-immer'

import { useConversation } from './use-conversation'

export const useChatState = () => {
  const {
    context,
    setContext,
    addConversation,
    getConversationUIState,
    setConversationUIState,
    batchSetConversationUIState
  } = useChatContext()

  const {
    conversation: newConversation,
    setConversation: setNewConversation,
    resetConversation: resetNewConversation
  } = useConversation('human')

  const allConversations = [...context.conversations, newConversation]

  const conversationsWithUIState = allConversations.map(conversation => ({
    ...conversation,
    uiState: getConversationUIState(context.id, conversation.id)
  }))

  const historiesConversationsWithUIState = conversationsWithUIState.filter(
    c => c.id !== newConversation.id
  )

  const newConversationUIState = useMemo(
    () => getConversationUIState(context.id, newConversation.id),
    [context, newConversation.id]
  )

  const replaceConversationAndTrimHistory = (conversation: Conversation) => {
    setContext(draft => {
      const index = draft.conversations.findIndex(c => c.id === conversation.id)

      // delete current conversation and all conversations after it
      index !== -1 && draft.conversations.splice(index)

      // add new conversation
      draft.conversations.push(conversation)
    })
  }

  const setAllConversationsUIState = (
    uiStateOrUpdater: ConversationUIState | DraftFunction<ConversationUIState>
  ) => {
    batchSetConversationUIState(
      context.id,
      allConversations.map(c => c.id),
      uiStateOrUpdater
    )
  }

  const prepareUIForSending = (conversationId: string) => {
    setAllConversationsUIState(draft => {
      draft.sendButtonDisabled = true
    })
    setConversationUIState(context.id, conversationId, draft => {
      draft.isLoading = true
    })
  }

  const resetUIAfterSending = (conversationId: string) => {
    setAllConversationsUIState(draft => {
      draft.sendButtonDisabled = false
    })
    setConversationUIState(context.id, conversationId, draft => {
      draft.isLoading = false
      draft.isEditMode = false
    })
  }

  const toggleConversationEditMode = (
    conversationId: string,
    isEditMode: boolean
  ) => {
    if (!isEditMode) {
      setConversationUIState(context.id, conversationId, draft => {
        draft.isEditMode = false
      })
    } else {
      setAllConversationsUIState(draft => {
        draft.isEditMode = false
      })
      setConversationUIState(context.id, conversationId, draft => {
        draft.isEditMode = true
      })
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
    replaceConversationAndTrimHistory,
    prepareUIForSending,
    resetUIAfterSending,
    toggleConversationEditMode,
    addConversation
  }
}
