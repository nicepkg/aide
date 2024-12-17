/* eslint-disable new-cap */
import type {
  BaseGraphNode,
  BaseGraphState
} from '@extension/webview-api/chat-context-processor/strategies/base/base-state'
import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base/base-strategy'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import type { ZodObjectAny } from '@langchain/core/dist/types/zod'
import type { ToolMessage } from '@langchain/core/messages'
import type { DynamicStructuredTool } from '@langchain/core/tools'
import type { Agent, Conversation, ConversationLog } from '@shared/entities'
import { settledPromiseResults } from '@shared/utils/common'
import { produce } from 'immer'
import { v4 as uuidv4 } from 'uuid'

import type { BaseAgent, GetAgentInput, GetAgentOutput } from './base-agent'

export interface BaseNodeContext<
  StrategyOptions extends BaseStrategyOptions = BaseStrategyOptions
> {
  strategyOptions: StrategyOptions
}

type AgentConstructor<T extends BaseAgent> = new (...args: any[]) => T

export type AgentConfig<T extends BaseAgent> = {
  agentClass: AgentConstructor<T>
  agentContext?: T['context']
  processAgentOutput?: (agentOutput: GetAgentOutput<T>) => GetAgentOutput<T>
}

export type AgentsConfig = {
  [K: string]: AgentConfig<BaseAgent>
}

type ExecuteAgentToolResult<T extends BaseAgent> = {
  agents: Agent<GetAgentInput<T>, GetAgentOutput<T>>[]
  logs: ConversationLog[]
}

type BuildAgentConfig<T extends BaseAgent, State extends BaseGraphState> = (
  state: State
) => AgentConfig<T>

export abstract class BaseNode<
  State extends BaseGraphState = BaseGraphState,
  StrategyOptions extends BaseStrategyOptions = BaseStrategyOptions
> {
  constructor(protected context: BaseNodeContext<StrategyOptions>) {
    this.onInit()
  }

  abstract onInit(): void

  protected agentNameBuildAgentConfigMap: Record<
    string,
    BuildAgentConfig<BaseAgent, State>
  > = {}

  protected createAgentConfig<T extends BaseAgent>(
    agentConfig: AgentConfig<T>
  ): AgentConfig<T> {
    return agentConfig
  }

  protected registerAgentConfig<T extends BaseAgent>(
    agentName: string,
    buildAgentConfig: BuildAgentConfig<T, State>
  ) {
    this.agentNameBuildAgentConfigMap[agentName] =
      buildAgentConfig as unknown as BuildAgentConfig<BaseAgent, State>
  }

  protected getAgentsConfig(state: State): AgentsConfig {
    return Object.fromEntries(
      Object.entries(this.agentNameBuildAgentConfigMap).map(
        ([agentName, buildAgentConfig]) => {
          const agentConfig = buildAgentConfig(state)
          return [agentName, agentConfig]
        }
      )
    )
  }

  protected getAgentConfig<T extends BaseAgent>(
    agentName: string,
    state: State
  ): AgentConfig<T> | null {
    return (
      (this.agentNameBuildAgentConfigMap[agentName]?.(
        state
      ) as unknown as AgentConfig<T>) || null
    )
  }

  abstract execute(state: State): Promise<Partial<State>>

  protected async createAgentToolByName<T extends BaseAgent>(
    agentName: string,
    state: State,
    overrideAgentContext?: T['context']
  ): Promise<{
    tool: DynamicStructuredTool<ZodObjectAny> | null
    agentConfig: AgentConfig<T> | null
    agentInstance: T | null
  }> {
    const agentConfig = this.getAgentConfig<T>(agentName, state)

    if (!agentConfig)
      return { tool: null, agentConfig: null, agentInstance: null }

    const finalAgentContext = {
      ...agentConfig.agentContext,
      ...overrideAgentContext
    }

    const agentInstance = new agentConfig.agentClass(finalAgentContext)
    const tool = await agentInstance.createTool()
    return { tool, agentConfig, agentInstance }
  }

  // Helper method to execute tool calls
  protected async executeAgentTool<T extends BaseAgent>(
    state: State,
    props: AgentConfig<T>
  ): Promise<ExecuteAgentToolResult<T>> {
    const { agentClass: AgentClass, agentContext, processAgentOutput } = props

    const results: ExecuteAgentToolResult<T> = {
      agents: [],
      logs: []
    }

    const { tool, agentConfig, agentInstance } =
      await this.createAgentToolByName(AgentClass.name, state, agentContext)

    if (!tool || !agentConfig || !agentInstance) return results

    const messages = agentConfig.agentContext?.state.messages || []

    if (!messages.length) return results

    const toolCalls = findCurrentToolsCallParams(messages.at(-1), [tool])

    if (!toolCalls.length) return results

    const toolCallsPromises = toolCalls.map(async toolCall => {
      const toolMessage = (await tool.invoke(toolCall)) as ToolMessage
      const agentOutput = JSON.parse(toolMessage?.lc_kwargs.content)

      const agent: Agent<GetAgentInput<T>, GetAgentOutput<T>> = {
        id: uuidv4(),
        name: tool.name,
        input: toolCall.args,
        output: processAgentOutput
          ? processAgentOutput(agentOutput)
          : agentOutput
      }

      const log = this.createAgentLog(agentInstance.logTitle, agent.id)

      results.agents.push(agent)
      results.logs.push(log)
    })

    await settledPromiseResults(toolCallsPromises)
    return results
  }

  // Helper method to add agent to conversation
  protected addAgentsToConversation<T extends BaseAgent>(
    conversation: Conversation,
    agents: Agent<GetAgentInput<T>, GetAgentOutput<T>>[]
  ) {
    conversation.agents = produce(conversation.agents, draft => {
      draft.push(...agents)
    })
  }

  protected addLogsToConversation(
    conversation: Conversation,
    logs: ConversationLog[]
  ) {
    conversation.logs = produce(conversation.logs, draft => {
      draft.push(...logs)
    })
  }

  // Helper method to create agent log
  protected createAgentLog(title: string, agentId: string): ConversationLog {
    return {
      id: uuidv4(),
      createdAt: Date.now(),
      title,
      agentId
    }
  }

  async createTools(
    state: State
  ): Promise<DynamicStructuredTool<ZodObjectAny>[]> {
    const agentsConfig = this.getAgentsConfig(state)
    const tools = await settledPromiseResults(
      Object.entries(agentsConfig).map(async ([_, agentConfig]) => {
        const agentInstance = await new agentConfig.agentClass(
          agentConfig.agentContext
        )
        const tool = await agentInstance.createTool()
        return tool
      })
    )

    return tools.filter(Boolean) as DynamicStructuredTool<ZodObjectAny>[]
  }

  createGraphNode<T extends BaseGraphNode = BaseGraphNode>(): T {
    return ((state: State) => this.execute(state)) as T
  }
}

export const createToolsFromNodes = async <
  T extends BaseNode<any, any>,
  StrategyOptions extends BaseStrategyOptions = BaseStrategyOptions,
  State extends BaseGraphState = BaseGraphState
>(props: {
  nodeClasses: (new (...args: any[]) => T)[]
  state: State
  strategyOptions: StrategyOptions
}) =>
  (
    await Promise.all(
      props.nodeClasses.map(async NodeClass => {
        const nodeInstance = new NodeClass(props.strategyOptions)
        return await nodeInstance.createTools(props.state)
      })
    )
  ).flat()

export const createGraphNodeFromNodes = async <
  T extends BaseNode<any, any>,
  StrategyOptions extends BaseStrategyOptions = BaseStrategyOptions
>(props: {
  nodeClasses: (new (...args: any[]) => T)[]
  strategyOptions: StrategyOptions
}) =>
  await Promise.all(
    props.nodeClasses.map(NodeClass =>
      new NodeClass(props.strategyOptions).createGraphNode()
    )
  )
