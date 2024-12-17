import type { BaseGraphState } from '@extension/webview-api/chat-context-processor/strategies/base/base-state'
import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base/base-strategy'
import { DynamicStructuredTool } from '@langchain/core/tools'
import type { Agent } from '@shared/entities'
import { z } from 'zod'

export interface AgentContext<
  State extends BaseGraphState = BaseGraphState,
  CreateToolOptions extends Record<string, any> = Record<string, any>,
  StrategyOptions extends BaseStrategyOptions = BaseStrategyOptions
> {
  state: State
  createToolOptions: CreateToolOptions
  strategyOptions: StrategyOptions
}

export abstract class BaseAgent<
  State extends BaseGraphState = BaseGraphState,
  CreateToolOptions extends Record<string, any> = Record<string, any>,
  StrategyOptions extends BaseStrategyOptions = BaseStrategyOptions,
  TInput extends z.ZodType = z.ZodType,
  TOutput extends z.ZodType = z.ZodType
> {
  abstract inputSchema: TInput

  abstract outputSchema: TOutput

  abstract name: string

  abstract logTitle: string

  abstract description: string

  constructor(
    public context: AgentContext<State, CreateToolOptions, StrategyOptions>
  ) {}

  // Abstract method that needs to be implemented by concrete agents
  abstract execute(input: z.infer<TInput>): Promise<z.infer<TOutput>>

  // Create the Langchain tool
  public async createTool(): Promise<DynamicStructuredTool | null> {
    return new DynamicStructuredTool({
      name: this.name,
      description: this.description,
      schema: this.inputSchema as any,
      func: async (input: z.infer<TInput>) => {
        const result = await this.execute(input)
        return this.outputSchema.parse(result)
      }
    })
  }
}

export type GetAgentInput<T extends BaseAgent> = z.infer<T['inputSchema']>

export type GetAgentOutput<T extends BaseAgent> = z.infer<T['outputSchema']>

export type GetAgent<T extends BaseAgent> = Agent<
  GetAgentInput<T>,
  GetAgentOutput<T>
>
