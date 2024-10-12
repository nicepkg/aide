import type { ChatContext, Conversation } from '@shared/types/chat-context'
import { UnPromise } from '@shared/types/common'

import { BaseStrategy } from '../base-strategy'
import { createChatWorkflow } from './chat-workflow'

export class ChatStrategy extends BaseStrategy {
  private _chatWorkflow: UnPromise<
    ReturnType<typeof createChatWorkflow>
  > | null = null

  private getChatWorkflow = async () => {
    if (!this._chatWorkflow) {
      this._chatWorkflow = await createChatWorkflow({
        registerManager: this.registerManager,
        commandManager: this.commandManager
      })
    }

    return this._chatWorkflow
  }

  async *getAnswers(
    chatContext: ChatContext
  ): AsyncGenerator<Conversation[], void, unknown> {
    const chatWorkflow = await this.getChatWorkflow()
    const graph = chatWorkflow.compile()

    const stream = await graph.stream({
      registerManager: this.registerManager,
      commandManager: this.commandManager,
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
