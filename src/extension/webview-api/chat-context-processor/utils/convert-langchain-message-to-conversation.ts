import type { MessageType } from '@langchain/core/messages'
import { ConversationEntity } from '@shared/entities/conversation-entity'
import type { Conversation } from '@shared/types/chat-context'
import type {
  LangchainMessage,
  LangchainMessageContents
} from '@shared/types/chat-context/langchain-message'
import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'

export const convertLangchainMessageToConversation = (
  message: LangchainMessage
): Conversation => {
  const messageType = message.toDict().type as MessageType
  const defaultConversation = new ConversationEntity({ role: messageType })
    .entity
  const contents: LangchainMessageContents = convertToLangchainMessageContents(
    message.content
  )

  return {
    ...defaultConversation,
    contents
  }
}
