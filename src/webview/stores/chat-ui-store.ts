import { ConversationUIState } from '@webview/types/chat'
import { produce } from 'immer'
import type { DraftFunction } from 'use-immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ChatUIStore = {
  sessionConversationUIStateMap: Record<string, ConversationUIState>
  getConversationUIState: (
    sessionId: string,
    conversationId: string
  ) => ConversationUIState
  setConversationUIState: (
    sessionId: string,
    conversationId: string,
    uiStateOrUpdater: ConversationUIState | DraftFunction<ConversationUIState>
  ) => void
  batchSetConversationUIState: (
    sessionId: string,
    conversationIds: string[],
    uiStateOrUpdater: ConversationUIState | DraftFunction<ConversationUIState>
  ) => void
}

export const useChatUIStore = create<ChatUIStore>()(
  immer((set, get) => ({
    sessionConversationUIStateMap: {},
    getConversationUIState: (sessionId: string, conversationId: string) =>
      get().sessionConversationUIStateMap[`${sessionId}_${conversationId}`] ||
      ({} as ConversationUIState),
    setConversationUIState: (
      sessionId: string,
      conversationId: string,
      uiStateOrUpdater: ConversationUIState | DraftFunction<ConversationUIState>
    ) => {
      const id = `${sessionId}_${conversationId}`

      if (typeof uiStateOrUpdater === 'function') {
        const newUIState = produce(
          get().sessionConversationUIStateMap[id] || {},
          uiStateOrUpdater
        )
        set(state => {
          if (!state.sessionConversationUIStateMap[id]) {
            state.sessionConversationUIStateMap[id] = {}
          }

          state.sessionConversationUIStateMap[id] = newUIState
        })
      } else {
        set(state => {
          if (!state.sessionConversationUIStateMap[id]) {
            state.sessionConversationUIStateMap[id] = {}
          }

          state.sessionConversationUIStateMap[id] = uiStateOrUpdater
        })
      }
    },
    batchSetConversationUIState: (
      sessionId: string,
      conversationIds: string[],
      uiStateOrUpdater: ConversationUIState | DraftFunction<ConversationUIState>
    ) => {
      if (typeof uiStateOrUpdater === 'function') {
        const idUIStateMap = conversationIds.map(conversationId => {
          const id = `${sessionId}_${conversationId}`
          return {
            id,
            uiState: produce(
              get().sessionConversationUIStateMap[id] || {},
              uiStateOrUpdater
            )
          }
        })

        set(state => {
          idUIStateMap.forEach(({ id, uiState }) => {
            if (!state.sessionConversationUIStateMap[id]) {
              state.sessionConversationUIStateMap[id] = {}
            }

            state.sessionConversationUIStateMap[id] = uiState
          })
        })
      } else {
        set(state => {
          conversationIds.forEach(conversationId => {
            const id = `${sessionId}_${conversationId}`
            if (!state.sessionConversationUIStateMap[id]) {
              state.sessionConversationUIStateMap[id] = {}
            }
            state.sessionConversationUIStateMap[id] = uiStateOrUpdater
          })
        })
      }
    }
  }))
)
