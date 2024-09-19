import type { BaseFunctionCallOptions } from '@langchain/core/language_models/base'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { AIMessageChunk } from '@langchain/core/messages'

export type AIModel = BaseChatModel<BaseFunctionCallOptions, AIMessageChunk>
