import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base-strategy'
import type {
  ChatGraphNode,
  ChatGraphState
} from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/nodes/state'
import type { StructuredTool } from '@langchain/core/tools'
import type { ChatContext } from '@shared/types/chat-context'
import type { Conversation } from '@shared/types/chat-context/conversation'

import { ProviderManager } from '../provider-manager'

export interface ChatStrategyProvider {
  buildSystemMessagePrompt?: (chatContext: ChatContext) => Promise<string>
  buildContextMessagePrompt?: (
    conversation: Conversation,
    chatContext: ChatContext
  ) => Promise<string>
  buildHumanMessagePrompt?: (
    conversation: Conversation,
    chatContext: ChatContext
  ) => Promise<string>
  buildHumanMessageEndPrompt?: (
    conversation: Conversation,
    chatContext: ChatContext
  ) => Promise<string>
  buildHumanMessageImageUrls?: (
    conversation: Conversation,
    chatContext: ChatContext
  ) => Promise<string[]>
  buildAgentTools?: (
    options: BaseStrategyOptions,
    graphState: ChatGraphState
  ) => Promise<StructuredTool[]>
  buildLanggraphToolNodes?: (
    options: BaseStrategyOptions
  ) => Promise<ChatGraphNode[]>
}

export const createProviderManagers = () =>
  ({
    chatStrategy: new ProviderManager<ChatStrategyProvider>()
  }) as const satisfies Record<string, ProviderManager<any>>
