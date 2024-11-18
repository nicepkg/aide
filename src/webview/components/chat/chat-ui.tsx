import { useRef, type FC } from 'react'
import { GearIcon, MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'
import { ChatContextType, type Conversation } from '@shared/entities'
import { isAbortError } from '@shared/utils/common'
import { useChatContext } from '@webview/contexts/chat-context'
import { useGlobalSearch } from '@webview/contexts/global-search-context'
import { useChatState } from '@webview/hooks/chat/use-chat-state'
import { useSendMessage } from '@webview/hooks/chat/use-send-message'
import { logger } from '@webview/utils/logger'
import { useNavigate } from 'react-router'
import { useKey } from 'react-use'

import { ButtonWithTooltip } from '../button-with-tooltip'
import { SidebarLayout } from '../sidebar-layout'
import { BorderBeam } from '../ui/border-beam'
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
  const { context, setContext, saveSession, createAndSwitchToNewSession } =
    useChatContext()
  const {
    newConversation,
    setNewConversation,
    historiesConversationsWithUIState,
    newConversationUIState,
    toggleConversationEditMode
  } = useChatState()
  const chatInputRef = useRef<ChatInputRef>(null)
  const { openSearch } = useGlobalSearch()
  const { sendMessage, cancelSending, isSending } = useSendMessage()

  useKey(
    event => (event.metaKey || event.ctrlKey) && event.key === 'Delete',
    () => {
      if (isSending) {
        cancelSending()
      }
    },
    { event: 'keydown' }
  )

  const handleSend = async (conversation: Conversation) => {
    try {
      await sendMessage(conversation)
      chatInputRef.current?.reInitializeEditor()
      chatInputRef.current?.focusOnEditor()
    } catch (error) {
      if (isAbortError(error)) return
      logger.error('Failed to send message:', error)
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
      <div className="relative w-full h-full overflow-hidden flex flex-col">
        <ChatMessages
          conversationsWithUIState={historiesConversationsWithUIState}
          context={context}
          setContext={setContext}
          onSend={handleSend}
          onEditModeChange={handleEditModeChange}
        />
        {isSending && (
          <div className="absolute left-1/2 bottom-[200px] -translate-x-1/2 z-10">
            <ButtonWithTooltip
              variant="secondary"
              size="default"
              tooltip="Cancel the message generation or pressing ⌘⌫"
              onClick={cancelSending}
              className="bg-secondary/50"
            >
              ⌘⌫ Cancel
              <BorderBeam size={50} duration={2} delay={0.5} />
            </ButtonWithTooltip>
          </div>
        )}
        <ChatInput
          ref={chatInputRef}
          autoFocus
          className="rounded-tl-xl rounded-tr-xl"
          context={context}
          setContext={setContext}
          conversation={newConversation}
          setConversation={setNewConversation}
          borderAnimation={newConversationUIState.isLoading}
          sendButtonDisabled={
            newConversationUIState.isLoading ??
            newConversationUIState.sendButtonDisabled ??
            false
          }
          onSend={handleSend}
        />
      </div>
    </SidebarLayout>
  )
}
