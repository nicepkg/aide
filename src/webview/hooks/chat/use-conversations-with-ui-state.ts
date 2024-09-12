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

  const conversationsWithUIState = conversations.map(conversation => ({
    ...conversation,
    uiState:
      conversationIdUIStateMap[conversation.id] ||
      ({} satisfies ConversationUIState)
  }))

  const getConversationUIState = (conversationId: string) =>
    conversationIdUIStateMap[conversationId] ||
    ({} satisfies ConversationUIState)

  const setConversationUIState = (
    conversationId: string,
    uiState: Partial<ConversationUIState>
  ) => {
    setConversationIdUIStateMap(draft => {
      draft[conversationId] = {
        ...draft[conversationId],
        ...uiState
      }
    })
  }

  const setAllConversationsUIState = (
    uiState: Partial<ConversationUIState>
  ) => {
    setConversationIdUIStateMap(draft => {
      conversations.forEach(conversation => {
        draft[conversation.id] = {
          ...draft[conversation.id],
          ...uiState
        }
      })
    })
  }

  return {
    conversationsWithUIState,
    conversationIdUIStateMap,
    setConversationIdUIStateMap,
    getConversationUIState,
    setConversationUIState,
    setAllConversationsUIState
  }
}
