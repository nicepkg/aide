import type { BaseMessage } from '@langchain/core/messages'
import { Annotation } from '@langchain/langgraph'
import type { ChatContext } from '@shared/types/chat-context'

import { baseState } from '../../base-state'
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
  shouldContinue: Annotation<boolean>({
    reducer: (x, y) => y ?? x,
    default: () => true
  }),
  ...baseState
})

export type ChatGraphState = typeof chatGraphState.State

export type ChatGraphNode = (
  state: ChatGraphState
) => Promise<Partial<ChatGraphState>>

export type CreateChatGraphNode = (
  options: BaseStrategyOptions
) => ChatGraphNode
