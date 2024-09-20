import { createModelProvider } from '@extension/ai/helpers'
import type { LangchainTool } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { convertLangchainMessageToConversation } from '@extension/webview-api/chat-context-processor/utils/convert-langchain-message-to-conversation'
import { getToolCallsFromMessage } from '@extension/webview-api/chat-context-processor/utils/get-tool-calls-from-message'
import { produce } from 'immer'

import { ChatMessagesConstructor } from '../messages-constructors/chat-messages-constructor'
import { createDocRetrieverTool } from './doc-retriever-node'
import type { ChatGraphNode } from './state'
import { createWebSearchTool } from './web-search-node'

export const agentNode: ChatGraphNode = async state => {
  const modelProvider = await createModelProvider()
  const aiModelAbortController = new AbortController()
  const aiModel = await modelProvider.getModel()

  const tools = [
    // doc
    await createDocRetrieverTool(state),
    // web search
    await createWebSearchTool(state)
  ].filter(Boolean) as LangchainTool[]

  const chatMessagesConstructor = new ChatMessagesConstructor(state.chatContext)
  const messagesFromChatContext =
    await chatMessagesConstructor.constructMessages()

  const response = await aiModel
    .bindTools(tools)
    .bind({ signal: aiModelAbortController.signal })
    .invoke(messagesFromChatContext)

  const toolCalls = getToolCallsFromMessage(response)

  if (!toolCalls.length) {
    const finalChatContext = produce(state.chatContext, draft => {
      draft.conversations.push(convertLangchainMessageToConversation(response))
    })

    return {
      chatContext: finalChatContext,
      shouldContinue: false
    }
  }

  return {
    messages: [response]
  }
}
