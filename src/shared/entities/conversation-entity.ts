import type { MessageType } from '@langchain/core/messages'
import type { PluginState } from '@shared/plugins/base/types'
import type { LangchainMessageContents } from '@shared/types/chat-context/langchain-message'
import { v4 as uuidv4 } from 'uuid'

import { BaseEntity, type IBaseEntity } from './base-entity'

export interface Conversation extends IBaseEntity {
  createdAt: number
  role: MessageType
  contents: LangchainMessageContents
  richText?: string
  pluginStates: Record<string, PluginState>
}

export class ConversationEntity extends BaseEntity<Conversation> {
  protected getDefaults(): Conversation {
    return {
      id: uuidv4(),
      createdAt: Date.now(),
      role: 'human',
      contents: [],
      pluginStates: {}
    }
  }
}
