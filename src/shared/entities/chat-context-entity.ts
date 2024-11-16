import { v4 as uuidv4 } from 'uuid'

import { BaseEntity, type IBaseEntity } from './base-entity'
import { ChatSessionEntity, type ChatSession } from './chat-session-entity'
import { type Conversation } from './conversation-entity'

export interface ChatContext extends IBaseEntity {
  type: ChatContextType
  createdAt: number
  updatedAt: number
  conversations: Conversation[]
  settings: SettingsContext
}

export class ChatContextEntity extends BaseEntity<ChatContext> {
  getDefaults(data?: Partial<ChatContext>): ChatContext {
    const now = Date.now()
    return {
      id: uuidv4(),
      type: ChatContextType.Chat,
      createdAt: now,
      updatedAt: now,
      conversations: [],
      settings: {
        explicitContext: '总是用中文回复'
      },
      ...data
    }
  }

  toChatSession(): ChatSession {
    const { entity } = this

    return new ChatSessionEntity({
      id: entity.id,
      title: this.getTitleFromConversations(entity.conversations),
      type: entity.type,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }).entity
  }

  private getTitleFromConversations = (
    conversations: Conversation[],
    defaultTitle = 'New Chat'
  ) => {
    let firstHumanMessageText = ''

    conversations
      .filter(conversation => conversation.role === 'human')
      .forEach(conversation =>
        conversation.contents.forEach(content => {
          if (content.type === 'text' && !firstHumanMessageText) {
            firstHumanMessageText = content.text
          }
        })
      )

    return firstHumanMessageText || defaultTitle
  }
}

export interface SettingsContext {
  explicitContext: string
}

export enum ChatContextType {
  Chat = 'chat',
  Composer = 'composer',
  UIDesigner = 'UIDesigner',
  AutoTask = 'auto-task'
}
