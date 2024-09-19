import type {
  BaseToolContext,
  ChatContext,
  Conversation
} from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { ToolCall } from '@langchain/core/dist/messages/tool'
import { tool } from '@langchain/core/tools'

import type { ContextProcessor } from '../types/context-processor'
import type { ToolsInfoMap } from '../types/tools'
import type { ProcessorRegistry } from './processor-registry'

export class ToolManager {
  async buildConversationToolsInfoMap(
    context: ChatContext,
    conversation: Conversation,
    processorRegistry: ProcessorRegistry
  ): Promise<ToolsInfoMap> {
    const toolsInfoMap: ToolsInfoMap = {}

    if (!conversation.attachments) return toolsInfoMap

    for (const [attachmentName, _processor] of processorRegistry.entries()) {
      const processor = _processor as ContextProcessor<BaseToolContext>

      if (!processor.buildAgentTools) continue

      const toolConfigs = await processor.buildAgentTools(
        conversation.attachments[attachmentName] as any,
        conversation,
        context
      )

      toolConfigs.forEach(toolConfig => {
        const toolName = toolConfig.toolParams.name
        toolsInfoMap[toolName] = {
          attachmentName,
          config: toolConfig,
          tool: tool(toolConfig.toolCallback, toolConfig.toolParams)
        }
      })
    }

    return toolsInfoMap
  }

  async updateContextByToolCalls(
    toolCalls: ToolCall[],
    aiToolsInfoMap: ToolsInfoMap,
    lastHumanConversation: Conversation,
    context: ChatContext
  ): Promise<ChatContext> {
    const updatedContext = { ...context }
    const updatedLastConversation = { ...lastHumanConversation }

    if (!updatedLastConversation.attachments) return updatedContext

    for (const toolCall of toolCalls) {
      const toolInfo = aiToolsInfoMap[toolCall.name]!
      const toolMessage = await toolInfo.tool.invoke(toolCall)
      const toolResult = toolMessage?.content ?? toolMessage?.kwargs?.content

      const newAttachment = await toolInfo.config.reBuildAttachment(
        toolResult,
        updatedLastConversation.attachments[toolInfo.attachmentName] as any,
        updatedLastConversation,
        updatedContext
      )

      updatedLastConversation.attachments = {
        ...updatedLastConversation.attachments,
        [toolInfo.attachmentName]: newAttachment
      }
    }

    updatedContext.conversations = [
      ...updatedContext.conversations.slice(0, -1),
      updatedLastConversation
    ]

    return updatedContext
  }
}
