import type { ChatContext, Conversation } from '@webview/types/chat'

export class ChatService {
  static async sendConversation(
    chatContext: ChatContext,
    newConversation: Conversation
  ): Promise<ChatContext> {
    return {
      ...chatContext,
      conversations: [...chatContext.conversations, newConversation]
    }
  }
}
