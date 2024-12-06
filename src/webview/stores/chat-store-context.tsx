/* eslint-disable react-compiler/react-compiler */
import React, { createContext, useContext, useRef, type FC } from 'react'
import { ChatStore, createChatStore } from '@webview/stores/chat-store'
import { useStore, type StoreApi } from 'zustand'

const ChatStoreContext = createContext<StoreApi<ChatStore> | null>(null)

export const ChatStoreProvider: FC<React.PropsWithChildren> = ({
  children
}) => {
  const storeRef = useRef<StoreApi<ChatStore>>(null)

  if (!storeRef.current) {
    storeRef.current = createChatStore()
  }

  return (
    <ChatStoreContext.Provider value={storeRef.current}>
      {children}
    </ChatStoreContext.Provider>
  )
}

export const useChatStore = <T,>(selector: (store: ChatStore) => T): T => {
  const store = useContext(ChatStoreContext)
  if (!store) {
    throw new Error('useChatStore must be used within ChatStoreProvider')
  }
  return useStore(store, selector)
}
