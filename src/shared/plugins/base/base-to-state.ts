import type {
  BaseAgent,
  GetAgentOutput
} from '@extension/webview-api/chat-context-processor/strategies/base/base-agent'
import type {
  Agent,
  Conversation,
  ConversationLog,
  Mention
} from '@shared/entities'

export type LogWithAgent<A extends Agent = Agent> = ConversationLog & {
  agent?: A
}

export abstract class BaseToState<M extends Mention> {
  mentions?: M[]

  agents?: Agent[]

  conversation?: Conversation

  constructor(conversation?: Conversation) {
    this.mentions = (conversation?.mentions || []) as M[]
    this.agents = (conversation?.agents || []) as Agent[]
    this.conversation = conversation
  }

  abstract toMentionsState(): unknown

  abstract toAgentsState(): unknown

  toLogWithAgent(): LogWithAgent[] {
    return toLogWithAgent(this.conversation)
  }

  getMentionDataByType<T extends string>(
    type: T
  ): Extract<M, { type: T }>['data'][] {
    if (!this.mentions?.length) return []
    const data: Mention['data'][] = []

    this.mentions?.forEach(mention => {
      if (mention.type === type && mention.data) {
        data.push(mention.data)
      }
    })

    return data
  }

  isMentionExit<T extends string>(type: T): boolean {
    if (!this.mentions?.length) return false
    return this.mentions?.some(mention => mention.type === type) || false
  }

  getAgentOutputs<T extends BaseAgent>(
    agentName: T['name']
  ): GetAgentOutput<T>[] {
    const outputs: GetAgentOutput<T>[] = []

    this.agents?.forEach(agent => {
      if (agent.name === agentName && agent.output) {
        outputs.push(agent.output)
      }
    })

    return outputs
  }

  getAgentOutputsByKey<T extends BaseAgent, K extends keyof GetAgentOutput<T>>(
    agentName: T['name'],
    key: K
  ): GetAgentOutput<T>[K][] {
    const outputs: GetAgentOutput<T>[K][] = []

    this.agents?.forEach(agent => {
      if (
        agent.name === agentName &&
        agent.output &&
        key in agent.output &&
        agent.output[key]
      ) {
        outputs.push(agent.output[key])
      }
    })

    return outputs
  }
}

export const toLogWithAgent = (
  conversation: Conversation | undefined
): LogWithAgent[] => {
  if (!conversation) return []

  const idAgentMap = new Map<string, Agent>()
  conversation.agents?.forEach(agent => {
    idAgentMap.set(agent.id, agent)
  })

  return (
    conversation.logs?.map(log => {
      if (!log.agentId) return log

      return {
        ...log,
        agent: idAgentMap.get(log.agentId)
      }
    }) || []
  )
}

export type GetMentionState<T extends BaseToState<any>> = ReturnType<
  T['toMentionsState']
>

export type GetAgentState<T extends BaseToState<any>> = ReturnType<
  T['toAgentsState']
>
