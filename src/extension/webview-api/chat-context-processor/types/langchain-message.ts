import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type BaseMessageFields
} from '@langchain/core/messages'

export type LangchainMessage = HumanMessage | SystemMessage | AIMessage
export type LangchainMessageParams = string | BaseMessageFields
