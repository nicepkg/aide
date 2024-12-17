import { ModelProviderFactory } from '@extension/ai/model-providers/helpers/factory'
import { ServerPluginRegister } from '@extension/registers/server-plugin-register'
import { getToolCallsFromMessage } from '@extension/webview-api/chat-context-processor/utils/get-tool-calls-from-message'
import type { AIMessageChunk } from '@langchain/core/messages'
import { type LangchainTool } from '@shared/entities'
import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'
import { mergeLangchainMessageContents } from '@shared/utils/merge-langchain-message-contents'
import { produce } from 'immer'

import { BaseNode } from '../../base/base-node'
import { dispatchBaseGraphState } from '../../base/base-state'
import { ChatMessagesConstructor } from '../messages-constructors/chat-messages-constructor'
import { type ChatGraphState } from '../state'

export class AgentNode extends BaseNode {
  onInit() {}

  async execute(state: ChatGraphState) {
    const modelProvider =
      await ModelProviderFactory.getModelProviderForChatContext(
        state.chatContext
      )
    const aiModel = await modelProvider.createLangChainModel()
    const chatStrategyProvider = this.context.strategyOptions.registerManager
      .getRegister(ServerPluginRegister)
      ?.serverPluginRegistry?.providerManagers.chatStrategy.mergeAll()

    const tools = [
      ...((await chatStrategyProvider?.buildAgentTools?.(
        this.context.strategyOptions,
        state
      )) || [])
    ].filter(Boolean) as LangchainTool[]

    const chatMessagesConstructor = new ChatMessagesConstructor({
      ...this.context.strategyOptions,
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
          draft.at(-1)!.contents = mergeLangchainMessageContents([
            ...draft.at(-1)!.contents,
            ...contents
          ])
        })
      }

      if (contents.length) {
        dispatchBaseGraphState({
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
}
