import { useRef, useState } from 'react'
import type { Conversation } from '@shared/entities'
import { useChatContext } from '@webview/contexts/chat-context'
import { api } from '@webview/services/api-client'
import { logger } from '@webview/utils/logger'

import { useChatState } from './use-chat-state'

export const useSendMessage = () => {
  const abortControllerRef = useRef<AbortController>(null)
  const { getContext, setContext, saveSession } = useChatContext()
  const {
    handleUIStateBeforeSend,
    handleConversationUpdate,
    resetConversationInput,
    handleUIStateAfterSend
  } = useChatState()
  const [isSending, setIsSending] = useState(false)

  const sendMessage = async (conversation: Conversation) => {
    // Cancel previous request if exists
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    try {
      setIsSending(true)
      handleUIStateBeforeSend(conversation.id)
      await handleConversationUpdate(conversation)

      let conversations: Conversation[] = []
      await api.chat.streamChat(
        {
          chatContext: getContext()
        },
        (newConversations: Conversation[]) => {
          conversations = newConversations
          setContext(draft => {
            draft.conversations = conversations
          })

          handleUIStateBeforeSend(conversations.at(-1)!.id)
        },
        abortControllerRef.current.signal
      )

      logger.verbose('Received conversations:', conversations)

      await saveSession()

      resetConversationInput(conversation.id)
    } finally {
      setIsSending(false)
      handleUIStateAfterSend()
    }
  }

  const cancelSending = () => {
    abortControllerRef.current?.abort()
  }

  return {
    sendMessage,
    cancelSending,
    isSending
  }
}
