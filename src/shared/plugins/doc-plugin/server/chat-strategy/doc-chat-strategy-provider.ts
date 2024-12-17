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

import { DocToState } from '../../doc-to-state'
import { DocRetrieverNode } from './doc-retriever-node'

interface ConversationWithStateProps {
  conversation: Conversation
  mentionState: GetMentionState<DocToState>
  agentState: GetAgentState<DocToState>
}

export class DocChatStrategyProvider implements ChatStrategyProvider {
  private createConversationWithStateProps(
    conversation: Conversation
  ): ConversationWithStateProps {
    const docToState = new DocToState(conversation)
    const mentionState = docToState.toMentionsState()
    const agentState = docToState.toAgentsState()

    return { conversation, mentionState, agentState }
  }

  async buildContextMessagePrompt(conversation: Conversation): Promise<string> {
    const props = this.createConversationWithStateProps(conversation)
    const relevantDocsPrompt = this.buildRelevantDocsPrompt(props)
    const prompts = [relevantDocsPrompt].filter(Boolean)

    return prompts.join('\n\n')
  }

  async buildAgentTools(
    strategyOptions: BaseStrategyOptions,
    state: ChatGraphState
  ): Promise<StructuredTool[]> {
    return await createToolsFromNodes({
      nodeClasses: [DocRetrieverNode],
      strategyOptions,
      state
    })
  }

  async buildLanggraphToolNodes(
    strategyOptions: BaseStrategyOptions
  ): Promise<ChatGraphNode[]> {
    return await createGraphNodeFromNodes({
      nodeClasses: [DocRetrieverNode],
      strategyOptions
    })
  }

  private buildRelevantDocsPrompt(props: ConversationWithStateProps): string {
    const { agentState } = props
    const { relevantDocs } = agentState

    if (!relevantDocs?.length) return ''

    let docsContent = ''

    relevantDocs.forEach(doc => {
      docsContent += `
Source Path: ${doc.path}
Content: ${doc.content}
`
    })

    return docsContent
      ? `
## Potentially Relevant Docs

${docsContent}
${CONTENT_SEPARATOR}
`
      : ''
  }
}

const CONTENT_SEPARATOR = `


-------



-------


`
