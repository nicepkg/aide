import { ModelProviderFactory } from '@extension/ai/model-providers/helpers/factory'
import {
  FeatureModelSettingKey,
  type LangchainMessageContents
} from '@shared/entities'
import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'
import { produce } from 'immer'

import { ChatMessagesConstructor } from '../messages-constructors/chat-messages-constructor'
import type { CreateChatGraphNode } from './state'

export const createGenerateNode: CreateChatGraphNode =
  options => async state => {
    const modelProvider = await ModelProviderFactory.getModelProvider(
      FeatureModelSettingKey.Chat
    )
    const aiModelAbortController = new AbortController()
    const aiModel = await modelProvider.createLangChainModel()

    const chatMessagesConstructor = new ChatMessagesConstructor({
      ...options,
      chatContext: state.chatContext
    })

    const messagesFromChatContext =
      await chatMessagesConstructor.constructMessages()

    const response = await aiModel
      .bind({ signal: aiModelAbortController.signal })
      .invoke(messagesFromChatContext)

    const newConversations = produce(state.newConversations, draft => {
      const contents: LangchainMessageContents =
        convertToLangchainMessageContents(response.content)

      draft.at(-1)!.contents.push(...contents)
    })

    return {
      messages: [response],
      newConversations
    }
  }
