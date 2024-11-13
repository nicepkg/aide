import type {
  AIMessage,
  ChatMessage,
  FunctionMessage,
  HumanMessage,
  MessageType,
  SystemMessage,
  ToolMessage
} from '@langchain/core/messages'
import type { RunnableToolLike } from '@langchain/core/runnables'
import type { StructuredToolInterface } from '@langchain/core/tools'
import type { PluginState } from '@shared/plugins/base/types'
import { v4 as uuidv4 } from 'uuid'

import { BaseEntity, type IBaseEntity } from './base-entity'

export interface Conversation extends IBaseEntity {
  createdAt: number
  role: MessageType
  contents: LangchainMessageContents
  richText?: string // JSON stringified
  pluginStates: Record<string, PluginState>
  logs: ConversationLog[]
}

export class ConversationEntity extends BaseEntity<Conversation> {
  protected getDefaults(): Conversation {
    return {
      id: uuidv4(),
      createdAt: Date.now(),
      role: 'human',
      contents: [],
      pluginStates: {},
      logs: []
    }
  }
}

export type BaseConversationLog = {
  id: string
  pluginId?: string
  createdAt: number
  title: string
  content?: string
}

export type ConversationLog = BaseConversationLog & {
  [key: string]: any
}

export type LangchainMessage =
  | HumanMessage
  | SystemMessage
  | AIMessage
  | ChatMessage
  | FunctionMessage
  | ToolMessage

export type LangchainMessageContents = (
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'image_url'
      image_url: string
    }
)[]

export type LangchainTool = StructuredToolInterface | RunnableToolLike
