import { useRef, type FC } from 'react'
import { GearIcon, MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'
import { ChatContextType, type Conversation } from '@shared/types/chat-context'
import { useChatContext } from '@webview/contexts/chat-context'
import { useGlobalSearch } from '@webview/contexts/global-search-context'
import { useChatState } from '@webview/hooks/chat/use-chat-state'
import { api } from '@webview/services/api-client'
import { logger } from '@webview/utils/logger'
import { useNavigate } from 'react-router'

import { ButtonWithTooltip } from '../button-with-tooltip'
import { GlowingCard } from '../glowing-card'
import { SidebarLayout } from '../sidebar-layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { ChatInput, type ChatInputRef } from './editor/chat-input'
import { ChatMessages } from './messages/chat-messages'
import { ChatSidebar } from './sidebar/chat-sidebar'

const CHAT_TYPES = [
  { value: ChatContextType.Chat, label: 'Chat' },
  { value: ChatContextType.Composer, label: 'Composer' },
  { value: ChatContextType.AutoTask, label: 'Auto Task' },
  { value: ChatContextType.UIDesigner, label: 'UI Designer' }
] as const

export const ChatUI: FC = () => {
  const navigate = useNavigate()
  const {
    context,
    setContext,
    getContext,
    saveSession,
    createAndSwitchToNewSession
  } = useChatContext()
  const {
    newConversation,
    setNewConversation,
    resetNewConversation,
    historiesConversationsWithUIState,
    newConversationUIState,
    replaceConversationAndTrimHistory,
    prepareUIForSending,
    resetUIAfterSending,
    toggleConversationEditMode
  } = useChatState()
  const chatInputRef = useRef<ChatInputRef>(null)
  const { openSearch } = useGlobalSearch()

  const resetNewConversationInput = () => {
    resetNewConversation()
    chatInputRef.current?.resetEditor()
  }

  const handleSend = async (conversation: Conversation) => {
    try {
      replaceConversationAndTrimHistory(conversation)
      prepareUIForSending(conversation.id)
      await saveSession()
      await api.chat.streamChat(
        {
          chatContext: getContext()
        },
        (conversations: Conversation[]) => {
          logger.verbose('Received conversations:', conversations)
          setContext(draft => {
            draft.conversations = conversations
          })
        }
      )

      await saveSession()
      toggleConversationEditMode(conversation.id, false)

      if (conversation.id === newConversation.id) {
        resetNewConversationInput()
      }

      chatInputRef.current?.focusOnEditor()
    } finally {
      resetUIAfterSending(conversation.id)
    }
  }

  const handleEditModeChange = (
    isEditMode: boolean,
    conversation: Conversation
  ) => {
    toggleConversationEditMode(conversation.id, isEditMode)
  }

  const handleContextTypeChange = (value: string) => {
    setContext(draft => {
      draft.type = value as ChatContextType
    })
    saveSession()
  }

  return (
    <SidebarLayout
      title=""
      sidebar={<ChatSidebar />}
      headerLeft={
        <>
          <ButtonWithTooltip
            variant="ghost"
            size="iconXs"
            tooltip="Search"
            side="bottom"
            className="shrink-0"
            onClick={openSearch}
          >
            <MagnifyingGlassIcon className="size-3" />
          </ButtonWithTooltip>
          <ButtonWithTooltip
            variant="ghost"
            size="iconXs"
            tooltip="New Chat"
            side="bottom"
            className="shrink-0"
            onClick={createAndSwitchToNewSession}
          >
            <PlusIcon className="size-3" />
          </ButtonWithTooltip>
          <ButtonWithTooltip
            variant="ghost"
            size="iconXs"
            tooltip="Settings"
            side="bottom"
            className="shrink-0"
            onClick={() => {
              navigate('/settings')
            }}
          >
            <GearIcon className="size-3" />
          </ButtonWithTooltip>
        </>
      }
      headerRight={
        <Select value={context.type} onValueChange={handleContextTypeChange}>
          <SelectTrigger className="h-6 w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHAT_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      className="chat-ui"
    >
      <ChatMessages
        conversationsWithUIState={historiesConversationsWithUIState}
        context={context}
        setContext={setContext}
        onSend={handleSend}
        onEditModeChange={handleEditModeChange}
      />

      <GlowingCard isAnimated={newConversationUIState.isLoading}>
        <ChatInput
          ref={chatInputRef}
          autoFocus
          context={context}
          setContext={setContext}
          conversation={newConversation}
          setConversation={setNewConversation}
          sendButtonDisabled={
            newConversationUIState.isLoading ??
            newConversationUIState.sendButtonDisabled ??
            false
          }
          onSend={handleSend}
        />
      </GlowingCard>
    </SidebarLayout>
  )
}
