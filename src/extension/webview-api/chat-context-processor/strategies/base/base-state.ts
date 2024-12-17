import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch'
import type { BaseMessage } from '@langchain/core/messages'
import { Annotation } from '@langchain/langgraph'
import {
  ConversationEntity,
  type ChatContext,
  type Conversation
} from '@shared/entities'
import { cloneDeep } from 'es-toolkit'

import type { BaseStrategyOptions } from './base-strategy'

export const baseGraphStateConfig = {
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
  abortController: Annotation<AbortController | null>({
    reducer: (x, y) => y ?? x,
    default: () => new AbortController()
  })
}

export const baseGraphState = Annotation.Root(baseGraphStateConfig)

export type BaseGraphState = typeof baseGraphState.State

export type BaseGraphNode<State extends BaseGraphState = BaseGraphState> = (
  state: State
) => Promise<Partial<State>>

export type CreateBaseGraphNode<
  StrategyOptions extends BaseStrategyOptions = BaseStrategyOptions,
  State extends BaseGraphState = BaseGraphState
> = (strategyOptions: StrategyOptions) => BaseGraphNode<State>

export const baseGraphStateEventName = 'stream-base-graph-state'
export const dispatchBaseGraphState = (state: Partial<BaseGraphState>) => {
  const deepClonedState = cloneDeep(state)
  dispatchCustomEvent(baseGraphStateEventName, deepClonedState)
}
