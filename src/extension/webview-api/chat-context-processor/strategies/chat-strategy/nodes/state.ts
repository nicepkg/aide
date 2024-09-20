import type { BaseMessage } from '@langchain/core/messages'
import { Annotation } from '@langchain/langgraph'
import type { ChatContext } from '@webview/types/chat'

export enum ChatGraphToolName {
  DocRetriever = 'docRetriever',
  WebSearch = 'webSearch'
}

export enum ChatGraphNodeName {
  Agent = 'agent',
  DocRetrieve = 'docRetrieve',
  WebSearch = 'webSearch',
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
  })
})

export type ChatGraphState = typeof chatGraphState.State
export type ChatGraphNode = (
  state: ChatGraphState
) => Promise<Partial<ChatGraphState>>
