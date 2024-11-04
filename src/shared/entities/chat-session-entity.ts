import { ChatContextType } from '@shared/types/chat-context'
import { v4 as uuidv4 } from 'uuid'

import { BaseEntity, type IBaseEntity } from './base-entity'

export interface ChatSession extends IBaseEntity {
  type: ChatContextType
  createdAt: number
  updatedAt: number
  title: string
}

export class ChatSessionEntity extends BaseEntity<ChatSession> {
  protected getDefaults(): ChatSession {
    const now = Date.now()
    return {
      id: uuidv4(),
      type: ChatContextType.Chat,
      createdAt: now,
      updatedAt: now,
      title: 'New Chat'
    }
  }
}
