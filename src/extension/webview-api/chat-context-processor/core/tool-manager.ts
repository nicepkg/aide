import { tryParseJSON } from '@extension/utils'
import type { ToolCall } from '@langchain/core/dist/messages/tool'
import { tool, type DynamicStructuredTool } from '@langchain/core/tools'

import type { ChatContext } from '../types/chat-context'
import type { BaseToolContext } from '../types/chat-context/base-tool-context'
import type { Conversation } from '../types/chat-context/conversation'
import type { ContextProcessor } from '../types/context-processor'
import type { AIModel, ToolsInfoMap } from '../types/core'
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

  bindToolsToModel(
    aiModel: AIModel,
    aiTools: DynamicStructuredTool[],
    aiModelAbortController: AbortController
  ) {
    return aiModel.bindTools!(aiTools).bind({
      signal: aiModelAbortController.signal
    })
  }

  async invokeToolAndGetResult(
    selectedTool: DynamicStructuredTool,
    toolCall: ToolCall
  ): Promise<any> {
    const toolMessage = await selectedTool.invoke(toolCall)
    return (
      tryParseJSON(toolMessage?.content || toolMessage?.kwargs?.content) || {}
    )
  }

  async processToolCalls(
    toolCalls: ToolCall[],
    aiToolsInfoMap: ToolsInfoMap,
    lastConversation: Conversation,
    context: ChatContext
  ): Promise<ChatContext> {
    const updatedContext = { ...context }
    const updatedLastConversation = { ...lastConversation }

    if (!updatedLastConversation.attachments) return updatedContext

    for (const toolCall of toolCalls) {
      const toolInfo = aiToolsInfoMap[toolCall.name]!
      const toolResult = await this.invokeToolAndGetResult(
        toolInfo.tool,
        toolCall
      )

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
