import { FsVisitAgent } from '@shared/plugins/agents/fs-visit-agent'
import {
  BaseNode,
  dispatchBaseGraphState,
  type ChatGraphState
} from '@shared/plugins/base/strategies'

export class FsVisitNode extends BaseNode {
  onInit() {
    this.registerAgentConfig(FsVisitAgent.name, state =>
      this.createAgentConfig({
        agentClass: FsVisitAgent,
        agentContext: {
          state,
          strategyOptions: this.context.strategyOptions,
          createToolOptions: {}
        }
      })
    )
  }

  async execute(state: ChatGraphState) {
    const toolCallsResults = await this.executeAgentTool(state, {
      agentClass: FsVisitAgent
    })

    if (!toolCallsResults.agents.length) return {}

    const newConversation = state.newConversations.at(-1)!
    this.addAgentsToConversation(newConversation, toolCallsResults.agents)
    this.addLogsToConversation(newConversation, toolCallsResults.logs)

    dispatchBaseGraphState({
      chatContext: state.chatContext,
      newConversations: state.newConversations
    })

    return {
      chatContext: state.chatContext,
      newConversations: state.newConversations
    }
  }
}
