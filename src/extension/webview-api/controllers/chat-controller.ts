import type { ChatContext, Conversation } from '@shared/types/chat-context'

import { ChatContextProcessor } from '../chat-context-processor'
import { Controller } from '../types'

export class ChatController extends Controller {
  readonly name = 'chat'

  async *streamChat(req: {
    chatContext: ChatContext
  }): AsyncGenerator<Conversation[], void, unknown> {
    const { chatContext } = req
    const chatContextProcessor = new ChatContextProcessor(
      this.registerManager,
      this.commandManager
    )
    const answerStream = await chatContextProcessor.getAnswers(chatContext)

    for await (const conversations of answerStream) {
      yield conversations
    }
  }
}
