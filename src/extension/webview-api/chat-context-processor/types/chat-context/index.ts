import type { Conversation } from './conversation'
import type { SettingsContext } from './settings-context'

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

export * from './base-tool-context'
export * from './code-context'
export * from './codebase-context'
export * from './conversation'
export * from './doc-context'
export * from './file-context'
export * from './git-context'
export * from './settings-context'
export * from './web-context'
