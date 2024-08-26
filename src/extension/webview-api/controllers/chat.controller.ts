import { Controller } from '../types'

export class ChatController extends Controller {
  readonly name = 'chat'

  sendMessage(req: { message: string }): Promise<string> {
    return Promise.resolve(`Hi, bro, I'm response to: ${req.message}`)
  }

  async *streamChat(req: {
    prompt: string
  }): AsyncGenerator<string, void, unknown> {
    for (let i = 0; i < 5; i++) {
      yield `Chunk ${i + 1} for prompt: ${req.prompt}`
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
