import type { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { IterableReadableStream } from '@langchain/core/utils/stream'

import type { ChatContext } from '../types/chat-context'
import type { LangchainMessage } from '../types/langchain-message'

export interface BaseStrategy {
  createSystemMessage(context: ChatContext): SystemMessage
  createUserInstructionMessage(context: ChatContext): HumanMessage | null
  buildMessages(context: ChatContext): Promise<LangchainMessage[]>
  getAnswers(
    context: ChatContext
  ): Promise<IterableReadableStream<LangchainMessage>>
}
