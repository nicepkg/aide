import type { ChatContext } from '@webview/types/chat'

export class ChatService {
  static async sendConversations(
    chatContext: ChatContext
  ): Promise<ChatContext> {
    await new Promise(resolve => setTimeout(resolve, 3000))
    return chatContext
  }
}
