import type { AIMessage } from '@langchain/core/messages'
import type { ToolCall } from '@langchain/core/messages/tool'

export const getToolCallsFromMessage = (message: AIMessage): ToolCall[] => {
  const toolCalls =
    message.tool_calls ??
    message?.lc_kwargs?.tool_calls ??
    message?.lc_kwargs?.additional_kwargs?.tool_calls ??
    []

  return toolCalls
}
