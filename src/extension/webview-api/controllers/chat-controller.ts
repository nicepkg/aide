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

  // sendMessage(req: { message: string }): Promise<string> {
  //   return Promise.resolve(`Hi, bro, I'm response to: ${req.message}`)
  // }

  // async *streamChat(req: {
  //   prompt: string
  // }): AsyncGenerator<string, void, unknown> {
  //   for (let i = 0; i < 5; i++) {
  //     yield `Chunk ${i + 1} for prompt: ${req.prompt}`
  //     await new Promise(resolve => setTimeout(resolve, 1000))
  //   }
  // }
}
