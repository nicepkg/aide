import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base-strategy'
import type {
  ChatGraphNode,
  ChatGraphState
} from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/nodes/state'
import type { StructuredTool } from '@langchain/core/tools'
import type { Conversation } from '@shared/entities'
import type { ChatStrategyProvider } from '@shared/plugins/base/server/create-provider-manager'
import { PluginId } from '@shared/plugins/base/types'

import type { DocPluginState } from '../../types'
import {
  createDocRetrieverNode,
  createDocRetrieverTool
} from './doc-retriever-node'

export class DocChatStrategyProvider implements ChatStrategyProvider {
  async buildContextMessagePrompt(conversation: Conversation): Promise<string> {
    const state = conversation.pluginStates?.[PluginId.Doc] as
      | Partial<DocPluginState>
      | undefined

    if (!state) return ''

    const relevantDocsPrompt = this.buildRelevantDocsPrompt(state)

    const prompts = [relevantDocsPrompt].filter(Boolean)

    return prompts.join('\n\n')
  }

  async buildAgentTools(
    options: BaseStrategyOptions,
    state: ChatGraphState
  ): Promise<StructuredTool[]> {
    const tools = await Promise.all([createDocRetrieverTool(options, state)])
    return tools.filter(Boolean) as StructuredTool[]
  }

  async buildLanggraphToolNodes(
    options: BaseStrategyOptions
  ): Promise<ChatGraphNode[]> {
    return [createDocRetrieverNode(options)]
  }

  private buildRelevantDocsPrompt(state: Partial<DocPluginState>): string {
    const { relevantDocsFromAgent: relevantDocsFromDocAgent } = state

    if (!relevantDocsFromDocAgent?.length) return ''

    let docsContent = ''

    relevantDocsFromDocAgent.forEach(doc => {
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
