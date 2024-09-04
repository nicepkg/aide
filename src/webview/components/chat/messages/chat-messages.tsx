import React, { useEffect, useRef } from 'react'
import {
  ClipboardIcon,
  ReloadIcon,
  SpeakerLoudIcon
} from '@radix-ui/react-icons'
import { Button } from '@webview/components/ui/button'
import type { Message } from '@webview/types/chat'
import { AnimatePresence, motion } from 'framer-motion'

import { ChatBubble, ChatBubbleMessage } from './chat-bubble'
import { ChatMessageList } from './chat-message-list'

const ChatAIIcons = [
  {
    icon: ClipboardIcon,
    label: 'Copy'
  },
  {
    icon: ReloadIcon,
    label: 'Refresh'
  },
  {
    icon: SpeakerLoudIcon,
    label: 'Volume'
  }
]

interface ChatMessagesProps {
  messages: Message[]
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <ChatMessageList
      ref={messagesContainerRef}
      className="chat-messages-container flex-1"
    >
      {/* Chat messages */}
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
            transition={{
              opacity: { duration: 0.1 },
              layout: {
                type: 'spring',
                bounce: 0.3,
                duration: index * 0.05 + 0.2
              }
            }}
            style={{ originX: 0.5, originY: 0.5 }}
            className="flex flex-col gap-2"
          >
            <ChatBubble key={index}>
              <ChatBubbleMessage
                variant={message.role === 'ai' ? 'received' : 'sent'}
                isLoading={message.isLoading}
              >
                {message.content}
                {message.role === 'ai' && (
                  <div className="flex items-center mt-1.5 gap-1">
                    {!message.isLoading && (
                      <>
                        {ChatAIIcons.map((icon, index) => {
                          const Icon = icon.icon
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              size="icon"
                              className="size-5"
                            >
                              <Icon className="size-3" />
                            </Button>
                          )
                        })}
                      </>
                    )}
                  </div>
                )}
              </ChatBubbleMessage>
            </ChatBubble>
          </motion.div>
        ))}
      </AnimatePresence>
    </ChatMessageList>
  )
}
