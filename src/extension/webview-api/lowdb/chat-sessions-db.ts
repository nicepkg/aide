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
    // Use entity's defaults
    const defaults = new ChatSessionEntity().getDefaults()

    super(
      path.join(aidePaths.getWorkspaceLowdbPath(), 'sessions.json'),
      defaults,
      ChatSessionsDB.schemaVersion
    )
  }

  async search(query: string): Promise<ChatSession[]> {
    const sessions = await this.getAll()
    return sessions.filter(session =>
      session.title.toLowerCase().includes(query.toLowerCase())
    )
  }
}

export const chatSessionsDB = new ChatSessionsDB()
