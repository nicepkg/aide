import type { ChatContext, Conversation } from '../types/chat-context'

export interface BaseStrategy {
  getAnswers(
    chatContext: ChatContext
  ): AsyncGenerator<Conversation[], void, unknown>
}
