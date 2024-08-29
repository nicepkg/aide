import { useEffect, useRef, useState } from 'react'
import {
  ClipboardIcon,
  ReloadIcon,
  SpeakerLoudIcon
} from '@radix-ui/react-icons'
import { Button } from '@webview/components/ui/button'
import type { Message } from '@webview/hooks/data'
import useChatStore from '@webview/hooks/use-chat-store'
import { AnimatePresence, motion } from 'framer-motion'

import { ChatBubble, ChatBubbleMessage } from './chat-bubble'
import { ChatInput } from './chat-input'
import { ChatMessageList } from './chat-message-list'
import { type EditorRef } from './editor/editor'

const ChatAiIcons = [
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

export const ChatUI = () => {
  const messages = useChatStore(state => state.chatBotMessages)
  const setMessages = useChatStore(state => state.setChatBotMessages)
  const selectedUser = useChatStore(state => state.selectedUser)
  const input = useChatStore(state => state.input)
  const setInput = useChatStore(state => state.setInput)
  const handleInputChange = useChatStore(state => state.handleInputChange)
  const hasInitialAIResponse = useChatStore(state => state.hasInitialAIResponse)
  const setHasInitialAIResponse = useChatStore(
    state => state.setHasInitialAIResponse
  )
  const [isLoading, setIsLoading] = useState(false)

  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const editorRef = useRef<EditorRef>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleComplete = () => {
    setInput(
      JSON.stringify(editorRef.current?.editor.getEditorState().toJSON()) ?? ''
    )
    handleSendMessage()
  }

  const handleSendMessage = () => {
    console.log('Sending message:', input)
    // e.preventDefault()
    if (!input) return

    setMessages(messages => [
      ...messages,
      {
        id: messages.length + 1,
        avatar: selectedUser.avatar,
        name: selectedUser.name,
        role: 'user',
        message: input
      }
    ])

    setInput('')
    formRef.current?.reset()
  }

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.editor.focus()
    }

    // Simulate AI response
    if (!hasInitialAIResponse) {
      setIsLoading(true)
      setTimeout(() => {
        setMessages((messages: Message[]) => [
          ...messages.slice(0, messages.length - 1),
          {
            id: messages.length + 1,
            avatar: '/chatbot.svg',
            name: 'ChatBot',
            role: 'ai',
            message: 'Sure! If you have any more questions, feel free to ask.'
          }
        ])
        setIsLoading(false)
        setHasInitialAIResponse(true)
      }, 2500)
    }
  }, [])

  return (
    <div className="h-full w-full">
      <div className="relative flex h-full flex-col justify-between rounded-xl lg:col-span-2">
        <ChatMessageList ref={messagesContainerRef} className="flex-1">
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
                <ChatBubble key={index} layout="ai">
                  <ChatBubbleMessage
                    variant={message.role === 'ai' ? 'received' : 'sent'}
                    isLoading={message.isLoading}
                  >
                    {message.message}
                    {message.role === 'ai' && (
                      <div className="flex items-center mt-1.5 gap-1">
                        {!message.isLoading && (
                          <>
                            {ChatAiIcons.map((icon, index) => {
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
        <ChatInput
          ref={editorRef}
          sendButtonDisabled={!input || isLoading}
          editorProps={{
            onComplete: handleComplete,
            onChange: editorState => {
              handleInputChange(JSON.stringify(editorState.toJSON()) ?? '')
            },
            placeholder: 'Type your message here...',
            className:
              'min-h-24 max-h-64 overflow-y-auto rounded-lg bg-background border-0 shadow-none focus-visible:ring-0'
          }}
        />
      </div>
    </div>
  )
}
