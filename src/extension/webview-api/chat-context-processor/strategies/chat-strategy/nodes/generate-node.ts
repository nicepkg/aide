import { ModelProviderFactory } from '@extension/ai/model-providers/helpers/factory'
import type { AIMessageChunk } from '@langchain/core/messages'
import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'
import { mergeLangchainMessageContents } from '@shared/utils/merge-langchain-message-contents'
import { produce } from 'immer'

import { BaseNode } from '../../base/base-node'
import { dispatchBaseGraphState } from '../../base/base-state'
import { ChatMessagesConstructor } from '../messages-constructors/chat-messages-constructor'
import { type ChatGraphState } from '../state'

export class GenerateNode extends BaseNode {
  onInit() {}

  async execute(state: ChatGraphState) {
    const modelProvider =
      await ModelProviderFactory.getModelProviderForChatContext(
        state.chatContext
      )
    const aiModel = await modelProvider.createLangChainModel()

    const chatMessagesConstructor = new ChatMessagesConstructor({
      ...this.context.strategyOptions,
      chatContext: state.chatContext
    })

    const messagesFromChatContext =
      await chatMessagesConstructor.constructMessages()

    const stream = await aiModel
      .bind({ signal: state.abortController?.signal })
      .stream(messagesFromChatContext)

    let message: AIMessageChunk | undefined
    let { newConversations } = state

    for await (const chunk of stream) {
      if (!message) {
        message = chunk
      } else {
        message = message.concat(chunk)
      }

      const contents = convertToLangchainMessageContents(message.content)

      if (contents.length) {
        newConversations = produce(state.newConversations, draft => {
          draft.at(-1)!.contents = mergeLangchainMessageContents([
            ...draft.at(-1)!.contents,
            ...contents
          ])
        })
      }

      dispatchBaseGraphState({
        newConversations,
        chatContext: state.chatContext
      })
    }

    return {
      messages: message ? [message] : undefined,
      newConversations
    }
  }
}
