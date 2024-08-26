import type { BaseFunctionCallOptions } from '@langchain/core/language_models/base'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { AIMessageChunk } from '@langchain/core/messages'
import type { DynamicStructuredTool } from '@langchain/core/tools'

import type { BaseToolContext } from './chat-context/base-tool-context'
import type { Attachments } from './chat-context/conversation'
import type { ToolConfig } from './langchain-tool'

export type ToolInfo = {
  attachmentName: keyof Attachments
  config: ToolConfig<BaseToolContext>
  tool: DynamicStructuredTool
}

export type ToolName = string

export type ToolsInfoMap = Record<ToolName, ToolInfo>

export type AIModel = BaseChatModel<BaseFunctionCallOptions, AIMessageChunk>
