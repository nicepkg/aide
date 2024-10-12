import type { MessageType } from '@langchain/core/messages'
import type { PluginState } from '@shared/plugins/base/types'
import type { LangchainMessageContents } from '@shared/types/chat-context/langchain-message'

export interface Conversation {
  id: string
  createdAt: number
  role: MessageType
  contents: LangchainMessageContents
  richText?: string // JSON stringified
  pluginStates: Record<string, PluginState>
}
