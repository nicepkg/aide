import type { Conversation } from '@extension/webview-api/chat-context-processor/types/chat-context'
import type {
  LangchainMessage,
  LangchainMessageContents
} from '@extension/webview-api/chat-context-processor/types/langchain-message'
import type { MessageType } from '@langchain/core/messages'
import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'
import { getDefaultConversation } from '@shared/utils/get-default-conversation'

export const convertLangchainMessageToConversation = (
  message: LangchainMessage
): Conversation => {
  const messageType = message.toDict().type as MessageType
  const defaultConversation = getDefaultConversation(messageType)
  const contents: LangchainMessageContents = convertToLangchainMessageContents(
    message.content
  )

  return {
    ...defaultConversation,
    contents
  }
}
