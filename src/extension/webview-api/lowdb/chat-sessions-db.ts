import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import {
  ChatSessionEntity,
  type ChatSession
} from '@shared/entities/chat-session-entity'

import { BaseDB } from './base-db'

class ChatSessionsDB extends BaseDB<ChatSession> {
  static readonly schemaVersion = 1

  constructor() {
    super(
      path.join(aidePaths.getWorkspaceLowdbPath(), 'sessions.json'),
      ChatSessionsDB.schemaVersion
    )
  }

  getDefaults(): Partial<ChatSession> {
    return new ChatSessionEntity().entity
  }

  async search(query: string): Promise<ChatSession[]> {
    const sessions = await this.getAll()
    return sessions.filter(session =>
      session.title.toLowerCase().includes(query.toLowerCase())
    )
  }
}

export const chatSessionsDB = new ChatSessionsDB()
