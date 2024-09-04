// src/webview/components/chat/sidebar/chat-sidebar.tsx
import React from 'react'
import { ArchiveIcon, PlusIcon } from '@radix-ui/react-icons'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import { Button } from '@webview/components/ui/button'

interface ChatHistoryItem {
  id: string
  title: string
}

const useChatHistory = (): ChatHistoryItem[] => [
  { id: '1', title: 'Chat 1' },
  { id: '2', title: 'Chat 2' },
  { id: '3', title: 'Chat 3' }
]

export const ChatSidebar: React.FC = () => {
  const chatHistory = useChatHistory()

  const handleNewChat = () => {
    console.log('New chat created')
  }

  const handleArchiveChat = (id: string) => {
    console.log(`Chat ${id} archived`)
  }

  return (
    <div className="flex flex-col h-full">
      <Button
        onClick={handleNewChat}
        className="mb-4 flex items-center justify-center"
      >
        <PlusIcon className="mr-2 size-4" />
        New Chat
      </Button>
      <nav className="flex-1 overflow-y-auto">
        {chatHistory.map(chat => (
          <div
            key={chat.id}
            className="flex items-center justify-between cursor-pointer px-2 py-1 hover:bg-muted rounded-lg mb-2"
          >
            <span>{chat.title}</span>
            <ButtonWithTooltip
              variant="ghost"
              size="sm"
              className="hover:bg-transparent"
              tooltip="Archive"
              onClick={() => handleArchiveChat(chat.id)}
            >
              <ArchiveIcon className="size-4" />
            </ButtonWithTooltip>
          </div>
        ))}
      </nav>
    </div>
  )
}
