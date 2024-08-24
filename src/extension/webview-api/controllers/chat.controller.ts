import { logger } from '@extension/logger'

import { APIError } from '../types'
import { BaseController } from './base.controller'

export const fetchChatStream = async (
  sessionId: string,
  text: string
): Promise<AsyncIterableIterator<string>> => {
  logger.log(text)
  async function* mockStream() {
    yield `[Session ${sessionId}] Hello`
    yield `[Session ${sessionId}] How`
    yield `[Session ${sessionId}] are`
    yield `[Session ${sessionId}] you?`
  }
  return mockStream()
}

export class ChatController extends BaseController {
  name = 'chat' as const

  handlers = {
    startChat: async (sessionId: string, params: { text: string }) => {
      try {
        const stream = await fetchChatStream(sessionId, params.text)
        for await (const chunk of stream) {
          this.apiManager.sendToWebview(
            `${this.name}.streamUpdate`,
            sessionId,
            chunk
          )
        }
        // await this.safeCall('file.logChat', sessionId, { message: params.text })
        return 'Chat completed'
      } catch (error) {
        logger.warn(`Error in startChat for session ${sessionId}:`, error)
        if (error instanceof APIError) {
          throw error
        }
        throw new APIError(
          'CHAT_ERROR',
          'An error occurred during the chat',
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : String(error)
        )
      }
    }
  }

  streamHandlers = {
    streamUpdate: (sessionId: string, data: string) => {
      logger.log(`Stream update for session ${sessionId}:`, data)
    }
  }
}
