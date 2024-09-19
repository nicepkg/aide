import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'
import { mergeStreamLangchainMessageContents } from '@shared/utils/merge-stream-langchain-message-contents'

import { ChatContextProcessor } from '../chat-context-processor'
import type {
  ChatContext,
  Conversation
} from '../chat-context-processor/types/chat-context'
import { convertLangchainMessageToConversation } from '../chat-context-processor/utils/convert-langchain-message-to-conversation'
import { Controller } from '../types'

export class ChatController extends Controller {
  readonly name = 'chat'

  async *streamChat(req: {
    chatContext: ChatContext
  }): AsyncGenerator<Conversation, void, unknown> {
    const { chatContext } = req
    const chatContextProcessor = new ChatContextProcessor()
    const answerStream = await chatContextProcessor.getAnswers(chatContext)

    let conversation: Conversation | null = null
    for await (const answer of answerStream) {
      if (!conversation) {
        conversation = convertLangchainMessageToConversation(answer)
      }

      conversation.contents = mergeStreamLangchainMessageContents(
        conversation.contents,
        convertToLangchainMessageContents(answer.content)
      )

      yield conversation
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
