import type { Conversation } from './conversation'
import { SettingsContext } from './settings-context'

export interface ChatContext {
  conversations: Conversation[]
  settings: SettingsContext
}
