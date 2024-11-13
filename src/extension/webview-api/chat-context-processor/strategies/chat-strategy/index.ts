import { type ChatContext, type Conversation } from '@shared/entities'
import { UnPromise } from '@shared/types/common'
import { produce } from 'immer'

import { BaseStrategy } from '../base-strategy'
import { createChatWorkflow } from './chat-workflow'
import type { ChatGraphState } from './nodes/state'

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
      chatContext
    })

    const state: Partial<ChatGraphState> = {}

    for await (const outputMap of stream) {
      for (const [nodeName] of Object.entries(outputMap)) {
        const returnsState = outputMap[nodeName] as ChatGraphState
        Object.assign(state, returnsState)

        if (state.chatContext && state.newConversations?.length) {
          const newChatContext = produce(state.chatContext, draft => {
            draft.conversations.push(...(state.newConversations ?? []))
          })

          yield newChatContext.conversations
        }
      }
    }
  }
}
