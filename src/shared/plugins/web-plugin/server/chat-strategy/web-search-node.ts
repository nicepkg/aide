import { WebSearchAgent } from '@shared/plugins/agents/web-search-agent'
import {
  BaseNode,
  dispatchBaseGraphState,
  type ChatGraphState
} from '@shared/plugins/base/strategies'

import { WebToState } from '../../web-to-state'

export class WebSearchNode extends BaseNode {
  onInit() {
    this.registerAgentConfig(WebSearchAgent.name, state => {
      const lastConversation = state.chatContext.conversations.at(-1)
      const mentionState = new WebToState(lastConversation).toMentionsState()

      return this.createAgentConfig({
        agentClass: WebSearchAgent,
        agentContext: {
          state,
          strategyOptions: this.context.strategyOptions,
          createToolOptions: {
            enableWebSearchAgent: mentionState.enableWebSearchAgent
          }
        }
      })
    })
  }

  async execute(state: ChatGraphState) {
    const toolCallsResults = await this.executeAgentTool(state, {
      agentClass: WebSearchAgent
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
