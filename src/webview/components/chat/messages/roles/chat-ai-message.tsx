import type { CSSProperties, FC, Ref } from 'react'
import type { Conversation } from '@shared/entities'
import { getAllTextFromLangchainMessageContents } from '@shared/utils/get-all-text-from-langchain-message-contents'
import { WithPluginProvider } from '@webview/contexts/plugin-context'
import type { ConversationUIState } from '@webview/types/chat'
import { cn } from '@webview/utils/common'

import { Markdown } from '../markdown'
import { ChatAIMessageLogAccordion } from './chat-log-preview'

export interface ChatAIMessageProps extends ConversationUIState {
  ref?: Ref<HTMLDivElement>
  className?: string
  style?: CSSProperties
  conversation: Conversation
  onEditModeChange?: (isEditMode: boolean, conversation: Conversation) => void
}

const _ChatAIMessage: FC<ChatAIMessageProps> = props => {
  const {
    ref,
    conversation,
    isLoading,
    className,
    style,
    isEditMode = false,
    onEditModeChange
  } = props

  return (
    <div ref={ref} className="w-full flex">
      <div
        className={cn(
          'mr-auto relative bg-background text-foreground border overflow-hidden rounded-md rounded-bl-[0px]',
          isEditMode && 'w-full',
          className
        )}
        style={style}
        onClick={() => {
          if (isEditMode) return
          onEditModeChange?.(true, conversation)
        }}
      >
        {conversation.logs.length > 0 && (
          <div className="flex items-center p-2 w-full">
            <ChatAIMessageLogAccordion
              conversation={conversation}
              isLoading={!!isLoading}
            />
          </div>
        )}
        <Markdown
          variant="chat"
          className={cn('px-2', !conversation.contents && 'opacity-50')}
        >
          {getAllTextFromLangchainMessageContents(conversation.contents)}
        </Markdown>
      </div>
    </div>
  )
}

export const ChatAIMessage = WithPluginProvider(_ChatAIMessage)
