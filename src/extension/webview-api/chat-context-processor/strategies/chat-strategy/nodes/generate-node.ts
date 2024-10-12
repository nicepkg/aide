import { createModelProvider } from '@extension/ai/helpers'
import { convertLangchainMessageToConversation } from '@extension/webview-api/chat-context-processor/utils/convert-langchain-message-to-conversation'
import { produce } from 'immer'

import { ChatMessagesConstructor } from '../messages-constructors/chat-messages-constructor'
import type { CreateChatGraphNode } from './state'

export const createGenerateNode: CreateChatGraphNode =
  options => async state => {
    const { chatContext } = state
    const modelProvider = await createModelProvider()
    const aiModelAbortController = new AbortController()
    const aiModel = await modelProvider.getModel()

    const chatMessagesConstructor = new ChatMessagesConstructor({
      ...options,
      chatContext: state.chatContext
    })

    const messagesFromChatContext =
      await chatMessagesConstructor.constructMessages()

    const response = await aiModel
      .bind({ signal: aiModelAbortController.signal })
      .invoke(messagesFromChatContext)

    const finalChatContext = produce(chatContext, draft => {
      draft.conversations.push(convertLangchainMessageToConversation(response))
    })

    return {
      messages: [response],
      chatContext: finalChatContext
    }
  }
