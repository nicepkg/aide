import { CodebaseSearchAgent } from '@shared/plugins/agents/codebase-search-agent'
import {
  BaseNode,
  dispatchBaseGraphState,
  type ChatGraphState
} from '@shared/plugins/base/strategies'

import { FsToState } from '../../fs-to-state'

export class CodebaseSearchNode extends BaseNode {
  onInit() {
    this.registerAgentConfig(CodebaseSearchAgent.name, state => {
      const lastConversation = state.chatContext.conversations.at(-1)
      const mentionState = new FsToState(lastConversation).toMentionsState()

      return this.createAgentConfig({
        agentClass: CodebaseSearchAgent,
        agentContext: {
          state,
          strategyOptions: this.context.strategyOptions,
          createToolOptions: {
            enableCodebaseAgent: mentionState.enableCodebaseAgent
          }
        }
      })
    })
  }

  async execute(state: ChatGraphState) {
    const toolCallsResults = await this.executeAgentTool(state, {
      agentClass: CodebaseSearchAgent
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
