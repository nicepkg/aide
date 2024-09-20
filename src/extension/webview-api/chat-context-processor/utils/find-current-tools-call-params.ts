import type { AIMessage, BaseMessage } from '@langchain/core/messages'
import type { ToolCall } from '@langchain/core/messages/tool'

import type { LangchainTool } from '../types/langchain-message'
import { getToolCallsFromMessage } from './get-tool-calls-from-message'

export const findCurrentToolsCallParams = (
  message: BaseMessage | undefined,
  tools: LangchainTool[]
): ToolCall[] => {
  if (message?._getType() !== 'ai') return []
  const currentToolsCallParams: ToolCall[] = []
  const currentToolsNames = tools.map(tool => tool.name)
  const toolCalls = getToolCallsFromMessage(message as AIMessage)

  toolCalls.forEach(async call => {
    if (currentToolsNames.includes(call.name)) {
      currentToolsCallParams.push({
        ...call,
        type: 'tool_call'
      })
    }
  })

  return currentToolsCallParams
}
