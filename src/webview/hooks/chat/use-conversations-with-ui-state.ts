import { useCallback, useMemo } from 'react'
import type { Conversation, ConversationUIState } from '@webview/types/chat'
import { useImmer } from 'use-immer'

export interface UseConversationsWithUIStateOptions {
  conversations: Conversation[]
}

export const useConversationsWithUIState = (
  options: UseConversationsWithUIStateOptions
) => {
  const { conversations } = options
  const [conversationIdUIStateMap, setConversationIdUIStateMap] = useImmer<
    Record<string, ConversationUIState>
  >({})

  const conversationsWithUIState = useMemo(
    () =>
      conversations.map(conversation => ({
        ...conversation,
        uiState:
          conversationIdUIStateMap[conversation.id] ||
          ({} satisfies ConversationUIState)
      })),
    [conversations, conversationIdUIStateMap]
  )

  const getConversationUIState = useCallback(
    (conversationId: string) =>
      conversationIdUIStateMap[conversationId] ||
      ({} satisfies ConversationUIState),
    [conversationIdUIStateMap]
  )

  const setConversationUIState = useCallback(
    (conversationId: string, uiState: Partial<ConversationUIState>) => {
      setConversationIdUIStateMap(draft => {
        draft[conversationId] = {
          ...draft[conversationId],
          ...uiState
        }
      })
    },
    [setConversationIdUIStateMap]
  )

  const setAllConversationsUIState = useCallback(
    (uiState: Partial<ConversationUIState>) => {
      setConversationIdUIStateMap(draft => {
        conversations.forEach(conversation => {
          draft[conversation.id] = {
            ...draft[conversation.id],
            ...uiState
          }
        })
      })
    },
    [conversations, setConversationIdUIStateMap]
  )

  return {
    conversationsWithUIState,
    conversationIdUIStateMap,
    setConversationIdUIStateMap,
    getConversationUIState,
    setConversationUIState,
    setAllConversationsUIState
  }
}
