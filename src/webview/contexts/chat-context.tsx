import React, { createContext, FC, useContext, useEffect } from 'react'
import type { ChatContext as IChatContext } from '@shared/types/chat-context'
import { useCallbackRef } from '@webview/hooks/use-callback-ref'
import { useChatStore, type ChatStore } from '@webview/stores/chat-store'
import { useChatUIStore, type ChatUIStore } from '@webview/stores/chat-ui-store'

type ChatContextValue = ChatStore &
  ChatUIStore & {
    getContext: () => IChatContext
  }

const ChatContext = createContext<ChatContextValue | null>(null)

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatContextProvider')
  }
  return context
}

export const ChatContextProvider: FC<React.PropsWithChildren> = ({
  children
}) => {
  const chatStore = useChatStore()
  const chatUIStore = useChatUIStore()
  const { refreshChatSessions } = chatStore

  useEffect(() => {
    refreshChatSessions()
  }, [refreshChatSessions])

  const getContext = useCallbackRef(() => chatStore.context)

  return (
    <ChatContext.Provider value={{ ...chatStore, ...chatUIStore, getContext }}>
      {children}
    </ChatContext.Provider>
  )
}
