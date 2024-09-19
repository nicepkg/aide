import type {
  BaseToolContext,
  ChatContext,
  Conversation
} from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { LangchainMessageContents } from '@extension/webview-api/chat-context-processor/types/langchain-message'

import type { ToolConfig } from './tools'

interface BaseContextProcessor<Attachment extends object> {
  buildMessageContents(
    attachment: Attachment,
    conversation: Conversation,
    context: ChatContext
  ): Promise<LangchainMessageContents>
}

interface ToolContextProcessor<Attachment extends object> {
  buildAgentTools(
    attachment: Attachment,
    conversation: Conversation,
    context: ChatContext
  ): Promise<ToolConfig<Attachment>[]>
}

export type ContextProcessor<Attachment extends object> =
  BaseContextProcessor<Attachment> &
    (Attachment extends BaseToolContext ? ToolContextProcessor<Attachment> : {})
