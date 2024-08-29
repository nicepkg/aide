import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { useChatContextManager } from '@webview/hooks/use-chat-context-manager'
import { ChatService } from '@webview/services/chat-service'

import { ChatHeader } from './chat-header'
import { ChatInput } from './chat-input'
import { ChatMessagesContainer } from './chat-messages-container'

export const ChatUI: React.FC = () => {
  const { context, setContext, newConversation, setNewConversation, messages } =
    useChatContextManager()

  const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
    mutationFn: () => ChatService.sendMessage(context, newConversation)
  })

  return (
    <div className="chat-ui h-full w-full flex flex-col">
      <ChatHeader />
      <div className="chat-body overflow-hidden flex-1 w-full flex flex-col justify-between rounded-xl lg:col-span-2">
        <ChatMessagesContainer messages={messages} />
        <ChatInput
          context={context}
          setContext={setContext}
          newConversation={newConversation}
          setNewConversation={setNewConversation}
          sendButtonDisabled={isSendingMessage}
          onSend={sendMessage}
        />
      </div>
    </div>
  )
}
