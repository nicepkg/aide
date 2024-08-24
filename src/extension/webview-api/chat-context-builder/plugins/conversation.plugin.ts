import { AIMessage, HumanMessage } from '@langchain/core/messages'

import type { ChatContext } from '../types/chat-context'
import type { LangchainMessageType } from '../types/langchain-message'
import { BasePlugin } from './base.plugin'

export class ConversationPlugin extends BasePlugin {
  name = 'Conversation'

  async buildContext(
    context: Partial<ChatContext>
  ): Promise<LangchainMessageType[]> {
    if (!context.conversation || context.conversation.length === 0) return []

    return context.conversation.map(msg => {
      if (msg.type === 'human') {
        return new HumanMessage(msg.text)
      }
      return new AIMessage(msg.text)
    })
  }
}
