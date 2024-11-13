import type { MessageType } from '@langchain/core/messages'
import {
  ConversationEntity,
  type Conversation,
  type LangchainMessage,
  type LangchainMessageContents
} from '@shared/entities'
import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'

export const convertLangchainMessageToConversation = (
  message: LangchainMessage,
  initConversation?: Partial<Conversation>
): Conversation => {
  const messageType = message.toDict().type as MessageType
  const defaultConversation = new ConversationEntity({
    ...initConversation,
    role: messageType
  }).entity
  const contents: LangchainMessageContents = convertToLangchainMessageContents(
    message.content
  )

  return {
    ...defaultConversation,
    contents
  }
}
