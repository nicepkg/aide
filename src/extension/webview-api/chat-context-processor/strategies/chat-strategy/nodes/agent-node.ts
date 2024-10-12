import { createModelProvider } from '@extension/ai/helpers'
import { ServerPluginRegister } from '@extension/registers/server-plugin-register'
import { convertLangchainMessageToConversation } from '@extension/webview-api/chat-context-processor/utils/convert-langchain-message-to-conversation'
import { getToolCallsFromMessage } from '@extension/webview-api/chat-context-processor/utils/get-tool-calls-from-message'
import type { LangchainTool } from '@shared/types/chat-context/langchain-message'
import { produce } from 'immer'

import { ChatMessagesConstructor } from '../messages-constructors/chat-messages-constructor'
import type { CreateChatGraphNode } from './state'

export const createAgentNode: CreateChatGraphNode = options => async state => {
  const modelProvider = await createModelProvider()
  const aiModelAbortController = new AbortController()
  const aiModel = await modelProvider.getModel()
  const chatStrategyProvider = options.registerManager
    .getRegister(ServerPluginRegister)
    ?.serverPluginRegistry?.providerManagers.chatStrategy.mergeAll()

  const tools = [
    ...((await chatStrategyProvider?.buildAgentTools?.(options, state)) || [])
  ].filter(Boolean) as LangchainTool[]

  const chatMessagesConstructor = new ChatMessagesConstructor({
    ...options,
    chatContext: state.chatContext
  })

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
