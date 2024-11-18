import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch'
import type { BaseMessage } from '@langchain/core/messages'
import { Annotation } from '@langchain/langgraph'
import {
  ConversationEntity,
  type ChatContext,
  type Conversation
} from '@shared/entities'

import type { BaseStrategyOptions } from '../../base-strategy'

export enum ChatGraphNodeName {
  Agent = 'agent',
  Tools = 'tools',
  Generate = 'generate'
}

export const chatGraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  chatContext: Annotation<ChatContext>({
    reducer: (x, y) => y ?? x
  }),
  newConversations: Annotation<[Conversation, ...Conversation[]]>({
    reducer: (x, y) => y ?? x,
    default: () => [new ConversationEntity({ role: 'ai' }).entity]
  }),
  shouldContinue: Annotation<boolean>({
    reducer: (x, y) => y ?? x,
    default: () => true
  }),
  abortController: Annotation<AbortController | null>({
    reducer: (x, y) => y ?? x,
    default: () => new AbortController()
  })
})

export type ChatGraphState = typeof chatGraphState.State

export type ChatGraphNode = (
  state: ChatGraphState
) => Promise<Partial<ChatGraphState>>

export type CreateChatGraphNode = (
  options: BaseStrategyOptions
) => ChatGraphNode

export const chatGraphStateEventName = 'stream-chat-graph-state'
export const dispatchGraphState = (state: Partial<ChatGraphState>) => {
  dispatchCustomEvent(chatGraphStateEventName, state)
}
