import type { ChatContext } from '@webview/types/chat'

export class ChatService {
  static async sendConversations(
    chatContext: ChatContext
  ): Promise<ChatContext> {
    return chatContext
  }
}
