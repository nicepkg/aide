import { aidePaths } from '@extension/file-utils/paths'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { logger } from '@extension/logger'
import type { ChatSession } from '@shared/entities'
import type { ChatContext, Conversation } from '@shared/types/chat-context'
import { convertChatContextToChatSession } from '@shared/utils/convert-chat-context-to-chat-session'

import { chatSessionsDB } from '../lowdb/chat-sessions-db'
import { Controller } from '../types'

export class ChatSessionController extends Controller {
  readonly name = 'chatSession'

  private getSessionFilePath(sessionId: string): string {
    return aidePaths.getSessionFilePath(sessionId)
  }

  async createSession(req: { chatContext: ChatContext }): Promise<ChatSession> {
    const chatSession = convertChatContextToChatSession(req.chatContext)
    const now = new Date().getTime()
    const session = await chatSessionsDB.add({
      ...chatSession,
      createdAt: now,
      updatedAt: now
    })

    await VsCodeFS.writeJsonFile(this.getSessionFilePath(session.id), {
      ...req.chatContext,
      createdAt: now,
      updatedAt: now
    })

    return session
  }

  async getChatContext(req: {
    sessionId: string
  }): Promise<ChatContext | null> {
    const filePath = this.getSessionFilePath(req.sessionId)
    try {
      return await VsCodeFS.readJsonFile<ChatContext>(filePath)
    } catch (error) {
      logger.error(`Failed to read session file: ${filePath}`, error)
      return null
    }
  }

  async updateSession(req: { chatContext: ChatContext }): Promise<void> {
    const now = new Date().getTime()
    const session = await chatSessionsDB.update(req.chatContext.id, {
      ...convertChatContextToChatSession(req.chatContext),
      updatedAt: now
    })

    if (session) {
      await VsCodeFS.writeJsonFile(this.getSessionFilePath(session.id), {
        ...req.chatContext,
        updatedAt: now
      })
    }
  }

  async createOrUpdateSession(req: {
    chatContext: ChatContext
  }): Promise<void> {
    const now = new Date().getTime()
    const session = await chatSessionsDB.createOrUpdate({
      ...convertChatContextToChatSession(req.chatContext),
      updatedAt: now
    })

    await VsCodeFS.writeJsonFile(this.getSessionFilePath(session.id), {
      ...req.chatContext,
      updatedAt: now
    })
  }

  async deleteSession(req: { sessionId: string }): Promise<void> {
    await chatSessionsDB.remove(req.sessionId)
    await VsCodeFS.unlink(this.getSessionFilePath(req.sessionId))
  }

  async getAllSessions(): Promise<ChatSession[]> {
    return await chatSessionsDB.getAll()
  }

  async searchSessions(req: { query: string }): Promise<ChatSession[]> {
    const sessions = await chatSessionsDB.search(req.query)
    const results: ChatSession[] = []

    for (const session of sessions) {
      const chatContext = await this.getChatContext({ sessionId: session.id })
      if (
        chatContext &&
        this.searchInConversations(chatContext.conversations, req.query)
      ) {
        results.push(session)
      }
    }

    return results
  }

  private searchInConversations(
    conversations: Conversation[],
    query: string
  ): boolean {
    return conversations.some(conv =>
      conv.contents.some(
        content =>
          content.type === 'text' &&
          content.text.toLowerCase().includes(query.toLowerCase())
      )
    )
  }
}
