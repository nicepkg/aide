import type { ChatContext, Conversation, Message } from '@webview/types/chat'

export class ChatService {
  static async getMessages(chatContext: ChatContext): Promise<Message[]> {
    return chatContext.conversations.map(conversation => ({
      id: conversation.id,
      content: conversation.content,
      createdAt: conversation.createdAt,
      role: conversation.role
    }))
  }

  static async sendMessage(
    chatContext: ChatContext,
    newConversation: Conversation
  ): Promise<ChatContext> {
    return {
      ...chatContext,
      conversations: [...chatContext.conversations, newConversation]
    }
  }
}
