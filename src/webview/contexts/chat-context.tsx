import React, { createContext, useCallback, useContext, useState } from 'react'
import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import { v4 as uuidv4 } from 'uuid'

import type { IChatContext, IConversation } from '../types/chat'

const ChatContext = createContext<IChatContext | undefined>(undefined)

export const ChatProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [conversations, setConversations] = useState<IConversation[]>([])
  const [currentAttachments, setCurrentAttachments] = useState<Attachments>(
    {} as Attachments
  )

  const addConversation = useCallback((conversation: IConversation) => {
    setConversations(prev => [...prev, { ...conversation, id: uuidv4() }])
    setCurrentAttachments({} as Attachments)
  }, [])

  const updateCurrentAttachments = useCallback(
    (newAttachments: Partial<Attachments>) => {
      setCurrentAttachments(prev => ({ ...prev, ...newAttachments }))
    },
    []
  )

  const resetChat = useCallback(() => {
    setConversations([])
    setCurrentAttachments({} as Attachments)
  }, [])

  const value: IChatContext = {
    conversations,
    currentAttachments,
    addConversation,
    updateCurrentAttachments,
    resetChat
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
