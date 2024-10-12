import type { Conversation } from './conversation'
import type { SettingsContext } from './settings-context'

export type { Conversation, SettingsContext }
export type {
  LangchainMessage,
  LangchainMessageContents
} from './langchain-message'

export enum ChatContextType {
  Chat = 'chat',
  Composer = 'composer',
  V0 = 'v0',
  AutoTask = 'auto-task'
}

export interface ChatContext {
  id: string
  type: ChatContextType
  createdAt: number
  updatedAt: number
  conversations: Conversation[]
  settings: SettingsContext
}
