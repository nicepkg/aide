import type { ControllerRegister } from '@extension/registers/controller-register'
import type { StructuredTool } from '@langchain/core/tools'
import type { ChatContext, Conversation, Mention } from '@shared/entities'
import type {
  BaseStrategyOptions,
  ChatGraphNode,
  ChatGraphState
} from '@shared/plugins/base/strategies'

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
    strategyOptions: BaseStrategyOptions,
    graphState: ChatGraphState
  ) => Promise<StructuredTool[]>
  buildLanggraphToolNodes?: (
    strategyOptions: BaseStrategyOptions
  ) => Promise<ChatGraphNode[]>
}

export type RefreshMentionFn = (mention: Mention) => Mention
export interface MentionUtilsProvider {
  createRefreshMentionFn: (
    controllerRegister: ControllerRegister
  ) => Promise<RefreshMentionFn>
}

export const createProviderManagers = () =>
  ({
    chatStrategy: new ProviderManager<ChatStrategyProvider>(),
    mentionUtils: new ProviderManager<MentionUtilsProvider>()
  }) as const satisfies Record<string, ProviderManager<any>>
