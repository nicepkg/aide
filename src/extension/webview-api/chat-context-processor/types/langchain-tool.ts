import type { ZodObjectAny } from '@langchain/core/dist/types/zod'
import type { RunnableFunc } from '@langchain/core/runnables'
import type { ResponseFormat, ToolParams } from '@langchain/core/tools'
import type { z } from 'zod'

import type { ChatContext } from './chat-context'
import type { Conversation } from './chat-context/conversation'

export interface ToolWrapperParams<
  RunInput extends
    | ZodObjectAny
    | z.ZodString
    | Record<string, any> = ZodObjectAny
> extends ToolParams {
  /**
   * The name of the tool. If using with an LLM, this
   * will be passed as the tool name.
   */
  name: string
  /**
   * The description of the tool.
   * @default `${fields.name} tool`
   */
  description?: string
  /**
   * The input schema for the tool. If using an LLM, this
   * will be passed as the tool schema to generate arguments
   * for.
   */
  schema?: RunInput
  /**
   * The tool response format.
   *
   * If "content" then the output of the tool is interpreted as the contents of a
   * ToolMessage. If "content_and_artifact" then the output is expected to be a
   * two-tuple corresponding to the (content, artifact) of a ToolMessage.
   *
   * @default "content"
   */
  responseFormat?: ResponseFormat
}

export type ToolConfig<
  Attachment extends object,
  ZodSchema extends ZodObjectAny = ZodObjectAny,
  ToolReturnType = any
> = {
  toolParams: ToolWrapperParams<ZodSchema>
  toolCallback: RunnableFunc<z.output<ZodSchema>, ToolReturnType>
  reBuildAttachment: (
    toolResult: ToolReturnType,
    attachment: Attachment,
    lastConversation: Conversation,
    context: ChatContext
  ) => Promise<Attachment>
}

export function createToolConfig<
  Attachment extends object,
  ZodSchema extends ZodObjectAny,
  ToolReturnType
>(
  config: ToolConfig<Attachment, ZodSchema, ToolReturnType>
): ToolConfig<Attachment> {
  return {
    toolParams: config.toolParams,
    toolCallback: config.toolCallback,
    reBuildAttachment: config.reBuildAttachment
  }
}
