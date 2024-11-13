import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base-strategy'
import type {
  ChatGraphNode,
  ChatGraphState
} from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/nodes/state'
import type { StructuredTool } from '@langchain/core/tools'
import type { Conversation } from '@shared/entities'
import type { ChatStrategyProvider } from '@shared/plugins/base/server/create-provider-manager'
import { PluginId } from '@shared/plugins/base/types'
import { removeDuplicates } from '@shared/utils/common'

import type { WebPluginState } from '../../types'
import { createWebSearchNode, createWebSearchTool } from './web-search-node'
import { createWebVisitNode, createWebVisitTool } from './web-visit-node'

export class WebChatStrategyProvider implements ChatStrategyProvider {
  async buildContextMessagePrompt(conversation: Conversation): Promise<string> {
    const state = conversation.pluginStates?.[PluginId.Web] as
      | Partial<WebPluginState>
      | undefined

    if (!state) return ''

    const relevantWebsPrompt = this.buildRelevantWebsPrompt(state)

    const prompts = [relevantWebsPrompt].filter(Boolean)

    return prompts.join('\n\n')
  }

  async buildAgentTools(
    options: BaseStrategyOptions,
    state: ChatGraphState
  ): Promise<StructuredTool[]> {
    const tools = await Promise.all([
      createWebSearchTool(options, state),
      createWebVisitTool(options, state)
    ])
    return tools.filter(Boolean) as StructuredTool[]
  }

  async buildLanggraphToolNodes(
    options: BaseStrategyOptions
  ): Promise<ChatGraphNode[]> {
    return [createWebSearchNode(options), createWebVisitNode(options)]
  }

  private buildRelevantWebsPrompt(state: Partial<WebPluginState>): string {
    const { webSearchAsDocFromAgent = [], webVisitResultsFromAgent = [] } =
      state

    const webDocs = [
      ...webSearchAsDocFromAgent,
      ...removeDuplicates(webVisitResultsFromAgent, ['url'])
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
