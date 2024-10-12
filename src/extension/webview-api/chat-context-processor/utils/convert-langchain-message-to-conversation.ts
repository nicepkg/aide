import type { MessageType } from '@langchain/core/messages'
import type { Conversation } from '@shared/types/chat-context'
import type {
  LangchainMessage,
  LangchainMessageContents
} from '@shared/types/chat-context/langchain-message'
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
