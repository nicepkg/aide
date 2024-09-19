import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type ChatMessage,
  type FunctionMessage,
  type ToolMessage
} from '@langchain/core/messages'

export type LangchainMessage =
  | HumanMessage
  | SystemMessage
  | AIMessage
  | ChatMessage
  | FunctionMessage
  | ToolMessage

export type LangchainMessageContents = (
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'image_url'
      image_url: string
    }
)[]
