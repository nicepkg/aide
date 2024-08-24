import {
  AIMessage,
  HumanMessage,
  SystemMessage
} from '@langchain/core/messages'

export type LangchainMessageType = HumanMessage | SystemMessage | AIMessage
