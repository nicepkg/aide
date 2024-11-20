import { useMemo } from 'react'
import type { Conversation } from '@shared/entities'
import { useChatContext } from '@webview/contexts/chat-context'
import type { ConversationUIState } from '@webview/types/chat'
import type { DraftFunction } from 'use-immer'

import { useCallbackRef } from '../use-callback-ref'

export const useChatState = () => {
  const {
    context,
    setContext,
    addConversation,
    deleteConversation,
    getConversationUIState,
    setConversationUIState,
    batchSetConversationUIState,
    saveSession,
    newConversation,
    setNewConversation,
    resetNewConversation
  } = useChatContext()

  const allConversations = [...context.conversations, newConversation]
  const getAllConversations = useCallbackRef(() => allConversations)

  const conversationsWithUIState = allConversations.map(conversation => ({
    ...conversation,
    uiState: getConversationUIState(context.id, conversation.id)
  }))

  const historiesConversationsWithUIState = conversationsWithUIState.filter(
    c => c.id !== newConversation.id
  )

  const newConversationUIState = useMemo(
    () => getConversationUIState(context.id, newConversation.id),
    [newConversation, conversationsWithUIState]
  )

  const setAllConversationsUIState = (
    uiStateOrUpdater: ConversationUIState | DraftFunction<ConversationUIState>
  ) => {
    batchSetConversationUIState(
      context.id,
      getAllConversations().map(c => c.id),
      uiStateOrUpdater
    )
  }

  const handleConversationUpdate = async (conversation: Conversation) => {
    setContext(draft => {
      const index = draft.conversations.findIndex(c => c.id === conversation.id)

      // delete current conversation and all conversations after it
      index !== -1 && draft.conversations.splice(index)

      // add new conversation
      draft.conversations.push(conversation)
    })

    return await saveSession()
  }

  const handleUIStateBeforeSend = (conversationId: string) => {
    setAllConversationsUIState(draft => {
      draft.sendButtonDisabled = true
    })
    setConversationUIState(context.id, conversationId, draft => {
      draft.isLoading = true
    })
  }

  const handleUIStateAfterSend = () => {
    setAllConversationsUIState(draft => {
      draft.sendButtonDisabled = false
      draft.isLoading = false
      draft.isEditMode = false
    })
  }

  const resetConversationInput = (conversationId: string) => {
    if (conversationId === newConversation.id) {
      resetNewConversation()
    }
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
    handleConversationUpdate,
    handleUIStateBeforeSend,
    handleUIStateAfterSend,
    resetConversationInput,
    toggleConversationEditMode,
    addConversation,
    deleteConversation
  }
}
