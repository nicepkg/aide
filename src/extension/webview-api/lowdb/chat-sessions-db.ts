import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import { ChatContextType } from '@shared/types/chat-context'

import { BaseDB, BaseItem } from './base-db'

export interface ChatSession extends BaseItem {
  type: ChatContextType
  createdAt: number
  updatedAt: number
  title: string
}

class ChatSessionsDB extends BaseDB<ChatSession> {
  constructor() {
    super(path.join(aidePaths.getWorkspaceLowdbPath(), 'sessions.json'))
  }

  async add(
    item: Omit<ChatSession, 'id'> & { id?: string }
  ): Promise<ChatSession> {
    return super.add(item)
  }

  async search(query: string): Promise<ChatSession[]> {
    const sessions = await this.getAll()
    return sessions.filter(session =>
      session.title.toLowerCase().includes(query.toLowerCase())
    )
  }
}

export const chatSessionsDB = new ChatSessionsDB()
