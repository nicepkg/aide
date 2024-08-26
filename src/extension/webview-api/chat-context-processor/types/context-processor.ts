import type { ChatContext } from './chat-context'
import type { BaseToolContext } from './chat-context/base-tool-context'
import type { Conversation } from './chat-context/conversation'
import type { LangchainMessageParams } from './langchain-message'
import type { ToolConfig } from './langchain-tool'

interface BaseContextProcessor<Attachment extends object> {
  buildMessageParams(
    attachment: Attachment,
    conversation: Conversation,
    context: ChatContext
  ): Promise<LangchainMessageParams>
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
