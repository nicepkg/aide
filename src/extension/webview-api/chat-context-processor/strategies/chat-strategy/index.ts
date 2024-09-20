import type {
  ChatContext,
  Conversation
} from '@extension/webview-api/chat-context-processor/types/chat-context'

import type { BaseStrategy } from '../base-strategy'
import { chatWorkflow } from './chat-workflow'

export class ChatStrategy implements BaseStrategy {
  async *getAnswers(
    chatContext: ChatContext
  ): AsyncGenerator<Conversation[], void, unknown> {
    const graph = chatWorkflow.compile()

    const stream = await graph.stream({
      chatContext
    })

    const oldConversationIds = new Set<string>(
      chatContext.conversations.map(conversation => conversation.id)
    )

    for await (const outputMap of stream) {
      for (const [nodeName] of Object.entries(outputMap)) {
        const conversations =
          outputMap[nodeName]?.chatContext?.conversations || []
        const lastConversation = conversations?.at(-1)

        if (lastConversation && !oldConversationIds.has(lastConversation.id)) {
          yield conversations
        }
      }
    }
  }
}
