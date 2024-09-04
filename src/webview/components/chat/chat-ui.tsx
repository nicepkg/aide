import type { FC } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useChatContextManager } from '@webview/hooks/chat/use-chat-context-manager'
import { ChatService } from '@webview/services/chat-service'

import { ChatInput } from './editor/chat-input'
import { ChatHeader } from './header/chat-header'
import { ChatLeftBarHistories } from './left-bar/chat-left-bar-histories'
import { ChatMessages } from './messages/chat-messages'

export const ChatUI: FC = () => {
  const { context, setContext, newConversation, setNewConversation, messages } =
    useChatContextManager()

  const { mutate: sendMessage, isPending: isSendingMessage } = useMutation({
    mutationFn: () => ChatService.sendMessage(context, newConversation)
  })

  return (
    <div className="chat-ui grid h-full w-full grid-flow-col grid-rows-[auto_1fr] md:grid-cols-[250px_1fr]">
      <div className="border-r p-4 hidden md:block h-full">
        <ChatLeftBarHistories />
      </div>
      <div>
        <ChatHeader />
      </div>
      <div className="chat-body bg-background overflow-hidden flex-1 w-full flex flex-col justify-between lg:col-span-2">
        <ChatMessages messages={messages} />
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
