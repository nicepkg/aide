import { ModelProviderFactory } from '@extension/ai/model-providers/helpers/factory'
import { ServerPluginRegister } from '@extension/registers/server-plugin-register'
import { getToolCallsFromMessage } from '@extension/webview-api/chat-context-processor/utils/get-tool-calls-from-message'
import {
  FeatureModelSettingKey,
  type LangchainMessageContents,
  type LangchainTool
} from '@shared/entities'
import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'
import { produce } from 'immer'

import { ChatMessagesConstructor } from '../messages-constructors/chat-messages-constructor'
import type { CreateChatGraphNode } from './state'

export const createAgentNode: CreateChatGraphNode = options => async state => {
  const modelProvider = await ModelProviderFactory.getModelProvider(
    FeatureModelSettingKey.Chat
  )
  const aiModelAbortController = new AbortController()
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

  const response = await aiModel
    .bindTools(tools)
    .bind({ signal: aiModelAbortController.signal })
    .invoke(messagesFromChatContext)

  const toolCalls = getToolCallsFromMessage(response)

  if (!toolCalls.length) {
    const newConversations = produce(state.newConversations, draft => {
      const contents: LangchainMessageContents =
        convertToLangchainMessageContents(response.content)

      draft.at(-1)!.contents.push(...contents)
    })

    return {
      newConversations,
      shouldContinue: false
    }
  }

  return {
    messages: [response]
  }
}
