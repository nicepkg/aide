import { InMemoryChatMessageHistory } from '@langchain/core/chat_history'
import { BaseMessage } from '@langchain/core/messages'

export class ChatHistoryManager {
  // sessionId -> chatHistory
  private static chatHistories: Record<string, InMemoryChatMessageHistory> = {}

  static getChatHistories() {
    return this.chatHistories
  }

  static clearAllHistories() {
    this.chatHistories = {}
  }

  static async getChatHistory(
    sessionId: string,
    initialMessages?: BaseMessage[]
  ): Promise<InMemoryChatMessageHistory> {
    if (!this.chatHistories[sessionId]) {
      const chatHistory = new InMemoryChatMessageHistory()

      if (initialMessages?.length) {
        await chatHistory.addMessages(initialMessages)
      }

      this.chatHistories[sessionId] = chatHistory
    }

    return this.chatHistories[sessionId]!
  }

  static async clearChatHistory(sessionId: string) {
    await this.chatHistories[sessionId]?.clear()
  }

  static deleteChatHistory(sessionId: string) {
    delete this.chatHistories[sessionId]
  }

  static async isChatExist(sessionId: string) {
    return (
      ((await this.chatHistories[sessionId]?.getMessages()) || []).length > 0
    )
  }
}
