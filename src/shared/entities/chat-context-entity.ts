import { ChatContextType, type Conversation } from '@shared/types/chat-context'
import type { SettingsContext } from '@shared/types/chat-context/settings-context'
import { v4 as uuidv4 } from 'uuid'

import { BaseEntity, type IBaseEntity } from './base-entity'
import { ChatSessionEntity, type ChatSession } from './chat-session-entity'

export interface ChatContext extends IBaseEntity {
  type: ChatContextType
  createdAt: number
  updatedAt: number
  conversations: Conversation[]
  settings: SettingsContext
}

export class ChatContextEntity extends BaseEntity<ChatContext> {
  getDefaults(): ChatContext {
    const now = Date.now()
    return {
      id: uuidv4(),
      type: ChatContextType.Chat,
      createdAt: now,
      updatedAt: now,
      conversations: [],
      settings: {
        allowLongFileScan: false,
        explicitContext: '总是用中文回复',
        fastApplyModelName: 'gpt-4o-mini',
        modelName: 'gpt-4o',
        useFastApply: true
      }
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
