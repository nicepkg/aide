import type { ChatContext, ChatSession, Conversation } from '@shared/entities'
import { ChatContextEntity } from '@shared/entities'
import { api } from '@webview/services/api-client'
import { logAndToastError } from '@webview/utils/common'
import { logger } from '@webview/utils/logger'
import { produce } from 'immer'
import type { DraftFunction } from 'use-immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ChatStore = {
  context: ChatContext
  chatSessions: ChatSession[]
  setContext: (
    contextOrUpdater: ChatContext | DraftFunction<ChatContext>
  ) => void
  getConversation: (id: string) => Conversation | undefined
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, conversation: Conversation) => void
  deleteConversation: (id: string) => void
  resetContext: () => void
  saveSession: () => Promise<void>
  refreshChatSessions: () => Promise<void>
  createAndSwitchToNewSession: () => Promise<void>
  deleteSession: (id: string) => Promise<void>
  switchSession: (sessionId: string) => Promise<void>
}

export const createChatStore = () =>
  create<ChatStore>()(
    immer((set, get) => ({
      context: new ChatContextEntity().entity,
      chatSessions: [] as ChatSession[],
      setContext: contextOrUpdater => {
        if (typeof contextOrUpdater === 'function') {
          const newContext = produce(get().context, contextOrUpdater)

          set(state => {
            state.context = newContext
          })
        } else {
          set(state => {
            state.context = contextOrUpdater
          })
        }
      },
      getConversation: id => get().context.conversations.find(c => c.id === id),
      addConversation: conversation =>
        set(state => {
          state.context.conversations.push(conversation)
        }),
      updateConversation: (id, conversation) =>
        set(state => {
          const index = state.context.conversations.findIndex(c => c.id === id)
          if (index !== -1) {
            state.context.conversations[index] = conversation
          }
        }),
      deleteConversation: id =>
        set(state => {
          state.context.conversations = state.context.conversations.filter(
            c => c.id !== id
          )
        }),
      resetContext: () => set({ context: new ChatContextEntity().entity }),
      saveSession: async () => {
        try {
          await api.chatSession.createOrUpdateSession({
            chatContext: get().context
          })
          await get().refreshChatSessions()
        } catch (error) {
          logAndToastError('Failed to save session', error)
        }
      },
      refreshChatSessions: async () => {
        try {
          const sessions = await api.chatSession.getAllSessions({})
          set(state => {
            state.chatSessions = sessions.sort(
              (a, b) => b.updatedAt - a.updatedAt
            )
          })
        } catch (error) {
          logAndToastError('Failed to refresh chat sessions', error)
        }
      },
      createAndSwitchToNewSession: async () => {
        try {
          const newContext = new ChatContextEntity().entity
          const newSession = await api.chatSession.createSession({
            chatContext: newContext
          })
          await get().refreshChatSessions()
          await get().switchSession(newSession.id)
          logger.log('New chat created')
        } catch (error) {
          logger.error('Failed to create and switch to new chat', error)
        }
      },
      deleteSession: async id => {
        try {
          await api.chatSession.deleteSession({ sessionId: id })
          await get().refreshChatSessions()
          if (get().context.id === id && get().chatSessions.length) {
            get().switchSession(get().chatSessions[0]!.id)
          }

          logger.log(`Chat ${id} deleted`)
        } catch (error) {
          logger.error(`Failed to delete chat ${id}`, error)
        }
      },
      switchSession: async sessionId => {
        try {
          if (get().context.id === sessionId) return
          const fullChatContext = await api.chatSession.getChatContext({
            sessionId
          })
          if (!fullChatContext) throw new Error('Chat context not found')
          set({ context: fullChatContext })
        } catch (error) {
          logAndToastError(`Failed to switch to session ${sessionId}`, error)
        }
      }
    }))
  )
