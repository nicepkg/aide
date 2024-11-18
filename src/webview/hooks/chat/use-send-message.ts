import { useRef } from 'react'
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

  const sendMessage = async (conversation: Conversation) => {
    // Cancel previous request if exists
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    try {
      handleUIStateBeforeSend(conversation.id)
      await handleConversationUpdate(conversation)

      await api.chat.streamChat(
        {
          chatContext: getContext()
          // signal: abortControllerRef.current.signal
        },
        (conversations: Conversation[]) => {
          logger.verbose('Received conversations:', conversations)
          setContext(draft => {
            draft.conversations = conversations
          })
          console.log('conversations666', conversations)

          handleUIStateBeforeSend(conversations.at(-1)!.id)
        }
      )

      await saveSession()

      resetConversationInput(conversation.id)
    } finally {
      handleUIStateAfterSend()
    }
  }

  const cancelSending = () => {
    abortControllerRef.current?.abort()
  }

  return {
    sendMessage,
    cancelSending
  }
}
