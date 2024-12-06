/* eslint-disable react-compiler/react-compiler */
import React, { createContext, useContext, useRef, type FC } from 'react'
import { ChatUIStore, createChatUIStore } from '@webview/stores/chat-ui-store'
import { useStore, type StoreApi } from 'zustand'

const ChatUIStoreContext = createContext<StoreApi<ChatUIStore> | null>(null)

export const ChatUIStoreProvider: FC<React.PropsWithChildren> = ({
  children
}) => {
  const storeRef = useRef<StoreApi<ChatUIStore>>(null)

  if (!storeRef.current) {
    storeRef.current = createChatUIStore()
  }

  return (
    <ChatUIStoreContext.Provider value={storeRef.current}>
      {children}
    </ChatUIStoreContext.Provider>
  )
}

export const useChatUIStore = <T,>(selector: (store: ChatUIStore) => T): T => {
  const store = useContext(ChatUIStoreContext)
  if (!store) {
    throw new Error('useChatUIStore must be used within ChatUIStoreProvider')
  }
  return useStore(store, selector)
}
