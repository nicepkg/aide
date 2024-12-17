import { Annotation } from '@langchain/langgraph'

import {
  baseGraphStateConfig,
  type BaseGraphNode,
  type CreateBaseGraphNode
} from '../base/base-state'
import type { BaseStrategyOptions } from '../base/base-strategy'

export enum ChatGraphNodeName {
  Agent = 'agent',
  Tools = 'tools',
  Generate = 'generate'
}

export const chatGraphState = Annotation.Root({
  ...baseGraphStateConfig,
  shouldContinue: Annotation<boolean>({
    reducer: (x, y) => y ?? x,
    default: () => true
  })
})

export type ChatGraphState = typeof chatGraphState.State

export type ChatGraphNode = BaseGraphNode<ChatGraphState>

export type CreateChatGraphNode = CreateBaseGraphNode<
  BaseStrategyOptions,
  ChatGraphState
>

// export const chatGraphStateEventName = 'stream-chat-graph-state'
// export const dispatchChatGraphState = (state: Partial<ChatGraphState>) => {
//   const deepClonedState = cloneDeep(state)
//   dispatchCustomEvent(chatGraphStateEventName, deepClonedState)
// }
