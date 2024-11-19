import { ModelProviderFactory } from '@extension/ai/model-providers/helpers/factory'
import { ServerPluginRegister } from '@extension/registers/server-plugin-register'
import { getToolCallsFromMessage } from '@extension/webview-api/chat-context-processor/utils/get-tool-calls-from-message'
import type { AIMessageChunk } from '@langchain/core/messages'
import { FeatureModelSettingKey, type LangchainTool } from '@shared/entities'
import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'
import { produce } from 'immer'

import { ChatMessagesConstructor } from '../messages-constructors/chat-messages-constructor'
import { dispatchChatGraphState, type CreateChatGraphNode } from './state'

export const createAgentNode: CreateChatGraphNode = options => async state => {
  const modelProvider = await ModelProviderFactory.getModelProvider(
    FeatureModelSettingKey.Chat
  )
  const aiModel = await modelProvider.createLangChainModel()
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

  const stream = await aiModel
    .bindTools(tools)
    .bind({ signal: state.abortController?.signal })
    .stream(messagesFromChatContext)

  let message: AIMessageChunk | undefined
  let shouldContinue = true
  let { newConversations } = state

  for await (const chunk of stream) {
    if (!message) {
      message = chunk
    } else {
      message = message.concat(chunk)
      // stream with tool calls not need to concat content
      message.content = chunk.content
    }

    const toolCalls = getToolCallsFromMessage(message)
    const contents = convertToLangchainMessageContents(message.content)

    if (!toolCalls.length && contents.length) {
      // no tool calls
      shouldContinue = false
      newConversations = produce(newConversations, draft => {
        draft.at(-1)!.contents.push(...contents)
      })
    }

    if (contents.length) {
      dispatchChatGraphState({
        newConversations,
        chatContext: state.chatContext
      })
    }
  }

  return {
    shouldContinue,
    newConversations,
    messages: message ? [message] : undefined
  }
}
