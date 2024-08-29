import type { Conversation } from './conversation'
import { SettingsContext } from './settings-context'

export interface ChatContext {
  id: string
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
