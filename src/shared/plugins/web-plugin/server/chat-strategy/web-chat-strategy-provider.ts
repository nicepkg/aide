import type { StructuredTool } from '@langchain/core/tools'
import type { Conversation } from '@shared/entities'
import type {
  GetAgentState,
  GetMentionState
} from '@shared/plugins/base/base-to-state'
import type { ChatStrategyProvider } from '@shared/plugins/base/server/create-provider-manager'
import {
  createGraphNodeFromNodes,
  createToolsFromNodes
} from '@shared/plugins/base/strategies'
import type {
  BaseStrategyOptions,
  ChatGraphNode,
  ChatGraphState
} from '@shared/plugins/base/strategies'
import { removeDuplicates } from '@shared/utils/common'

import { WebToState } from '../../web-to-state'
import { WebSearchNode } from './web-search-node'
import { WebVisitNode } from './web-visit-node'

interface ConversationWithStateProps {
  conversation: Conversation
  mentionState: GetMentionState<WebToState>
  agentState: GetAgentState<WebToState>
}

export class WebChatStrategyProvider implements ChatStrategyProvider {
  private createConversationWithStateProps(
    conversation: Conversation
  ): ConversationWithStateProps {
    const webToState = new WebToState(conversation)
    const mentionState = webToState.toMentionsState()
    const agentState = webToState.toAgentsState()

    return { conversation, mentionState, agentState }
  }

  async buildContextMessagePrompt(conversation: Conversation): Promise<string> {
    const props = this.createConversationWithStateProps(conversation)

    const relevantWebsPrompt = this.buildRelevantWebsPrompt(props)

    const prompts = [relevantWebsPrompt].filter(Boolean)

    return prompts.join('\n\n')
  }

  async buildAgentTools(
    strategyOptions: BaseStrategyOptions,
    state: ChatGraphState
  ): Promise<StructuredTool[]> {
    return await createToolsFromNodes({
      nodeClasses: [WebSearchNode, WebVisitNode],
      strategyOptions,
      state
    })
  }

  async buildLanggraphToolNodes(
    strategyOptions: BaseStrategyOptions
  ): Promise<ChatGraphNode[]> {
    return await createGraphNodeFromNodes({
      nodeClasses: [WebSearchNode, WebVisitNode],
      strategyOptions
    })
  }

  private buildRelevantWebsPrompt(props: ConversationWithStateProps): string {
    const { agentState } = props
    const { webSearchRelevantContent = [], webVisitContents = [] } = agentState

    const webDocs = [
      ...webSearchRelevantContent.map(content => ({
        url: '',
        content
      })),
      ...removeDuplicates(webVisitContents, ['url'])
    ]

    if (!webDocs.length) return ''

    let webContent = ''

    webDocs.forEach(webDoc => {
      webContent += `
Source Url: ${webDoc.url}
Content: ${webDoc.content}
`
    })

    return webContent
      ? `
## Potentially Relevant Webs

${webContent}
${CONTENT_SEPARATOR}
`
      : ''
  }
}

const CONTENT_SEPARATOR = `


-------



-------


`
