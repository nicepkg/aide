import { ModelProviderFactory } from '@extension/ai/model-providers/helpers/factory'
import type { AIMessageChunk } from '@langchain/core/messages'
import { FeatureModelSettingKey } from '@shared/entities'
import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'
import { produce } from 'immer'

import { ChatMessagesConstructor } from '../messages-constructors/chat-messages-constructor'
import { dispatchChatGraphState, type CreateChatGraphNode } from './state'

export const createGenerateNode: CreateChatGraphNode =
  options => async state => {
    const modelProvider = await ModelProviderFactory.getModelProvider(
      FeatureModelSettingKey.Chat
    )
    const aiModel = await modelProvider.createLangChainModel()

    const chatMessagesConstructor = new ChatMessagesConstructor({
      ...options,
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
          draft.at(-1)!.contents.push(...contents)
        })
      }

      dispatchChatGraphState({
        newConversations,
        chatContext: state.chatContext
      })
    }

    return {
      messages: message ? [message] : undefined,
      newConversations
    }
  }
