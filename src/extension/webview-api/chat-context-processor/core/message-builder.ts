import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type MessageType
} from '@langchain/core/messages'

import type {
  LangchainMessage,
  LangchainMessageParams
} from '../types/langchain-message'

export class MessageBuilder {
  static createMessage(
    type: MessageType,
    messageParams: LangchainMessageParams
  ): LangchainMessage {
    switch (type) {
      case 'human':
        return new HumanMessage(messageParams)
      case 'ai':
        return new AIMessage(messageParams)
      case 'system':
        return new SystemMessage(messageParams)
      default:
        throw new Error(`Unsupported message type: ${type}`)
    }
  }
}
