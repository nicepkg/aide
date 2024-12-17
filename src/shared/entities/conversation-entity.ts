import type { FileInfo } from '@extension/file-utils/traverse-fs'
import type {
  AIMessage,
  ChatMessage,
  FunctionMessage,
  HumanMessage,
  ImageDetail,
  MessageType,
  SystemMessage,
  ToolMessage
} from '@langchain/core/messages'
import type { RunnableToolLike } from '@langchain/core/runnables'
import type { StructuredToolInterface } from '@langchain/core/tools'
import type { PluginState } from '@shared/plugins/base/types'
import { v4 as uuidv4 } from 'uuid'

import { BaseEntity, type IBaseEntity } from './base-entity'

export interface ImageInfo {
  url: string
  name?: string
}

export interface ConversationState {
  selectedFilesFromFileSelector: FileInfo[]
  currentFilesFromVSCode: FileInfo[]
  selectedImagesFromOutsideUrl: ImageInfo[]
}

export interface Conversation extends IBaseEntity {
  createdAt: number
  role: MessageType
  contents: LangchainMessageContents
  richText?: string // JSON stringified
  pluginStates: Record<string, PluginState>
  mentions: Mention[]
  agents: Agent[]
  logs: ConversationLog[]
  state: ConversationState
}

export class ConversationEntity extends BaseEntity<Conversation> {
  protected getDefaults(data?: Partial<Conversation>): Conversation {
    return {
      id: uuidv4(),
      createdAt: Date.now(),
      role: 'human',
      contents: [],
      pluginStates: {},
      mentions: [],
      agents: [],
      logs: [],
      state: {
        selectedFilesFromFileSelector: [],
        currentFilesFromVSCode: [],
        selectedImagesFromOutsideUrl: []
      },
      ...data
    }
  }
}

export interface Mention<Type extends string = string, Data = any> {
  type: Type
  data: Data
}

export interface Agent<Input = any, Output = any> {
  id: string
  name: string
  input: Input
  output: Output
}

export type ConversationLog = {
  id: string
  createdAt: number
  title: string
  content?: string
  agentId?: string
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
      image_url: {
        url: string
        detail?: ImageDetail
      }
    }
)[]

export type LangchainTool = StructuredToolInterface | RunnableToolLike
