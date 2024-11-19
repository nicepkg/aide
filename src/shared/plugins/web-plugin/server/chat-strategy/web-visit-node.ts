/* eslint-disable unused-imports/no-unused-vars */
import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base-strategy'
import {
  dispatchChatGraphState,
  type ChatGraphState,
  type CreateChatGraphNode
} from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/nodes/state'
import { DocCrawler } from '@extension/webview-api/chat-context-processor/utils/doc-crawler'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import type { ToolMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import type { ConversationLog, LangchainTool } from '@shared/entities'
import { PluginId } from '@shared/plugins/base/types'
import { settledPromiseResults } from '@shared/utils/common'
import { produce } from 'immer'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import type { WebDocInfo, WebPluginLog, WebPluginState } from '../../types'

interface WebVisitToolResult {
  contents: WebDocInfo[]
}

export const createWebVisitTool = async (
  options: BaseStrategyOptions,
  state: ChatGraphState
) => {
  const getPageContents = async (urls: string[]): Promise<WebDocInfo[]> => {
    const docCrawler = new DocCrawler(urls[0]!)
    const contents = await settledPromiseResults(
      urls.map(async url => ({
        url,
        content:
          (await docCrawler.getPageContent(url)) || 'Failed to retrieve content'
      }))
    )
    return contents
  }

  return new DynamicStructuredTool({
    name: 'webVisit',
    description:
      'Visit specific web pages and retrieve their content. Use this tool when you need to access and analyze the content of one or more web pages.',
    func: async ({ urls }): Promise<WebVisitToolResult> => {
      const contents = await getPageContents(urls)
      return { contents }
    },
    schema: z.object({
      urls: z
        .array(z.string().url())
        .describe(
          'An array of URLs to visit and retrieve content from. Each URL should be a valid web address.'
        )
    })
  })
}

export const createWebVisitNode: CreateChatGraphNode =
  options => async state => {
    const { conversations } = state.chatContext
    const lastConversation = conversations.at(-1)
    const webPluginState = lastConversation?.pluginStates?.[PluginId.Web] as
      | Partial<WebPluginState>
      | undefined
    const logs: ConversationLog[] = []

    if (!webPluginState?.enableWebVisitAgent) return {}

    const webVisitTool = await createWebVisitTool(options, state)

    if (!webVisitTool) return {}

    const tools: LangchainTool[] = [webVisitTool]
    const lastMessage = state.messages.at(-1)
    const toolCalls = findCurrentToolsCallParams(lastMessage, tools)

    if (!toolCalls.length) return {}

    const toolCallsPromises = toolCalls.map(async toolCall => {
      const toolMessage = (await webVisitTool.invoke(toolCall)) as ToolMessage

      const result = JSON.parse(
        toolMessage?.lc_kwargs.content
      ) as WebVisitToolResult

      lastConversation!.pluginStates![PluginId.Web] = produce(
        lastConversation!.pluginStates![
          PluginId.Web
        ] as Partial<WebPluginState>,
        (draft: Partial<WebPluginState>) => {
          if (!draft.webVisitResultsFromAgent) {
            draft.webVisitResultsFromAgent = []
          }

          draft.webVisitResultsFromAgent.push(...result.contents)
        }
      )

      logs.push({
        id: uuidv4(),
        createdAt: Date.now(),
        pluginId: PluginId.Web,
        title: 'Visit web',
        webVisitResultsFromAgent: result.contents
      } satisfies WebPluginLog)
    })

    await settledPromiseResults(toolCallsPromises)

    const newConversations = produce(state.newConversations, draft => {
      draft.at(-1)!.logs.push(...logs)
    })

    dispatchChatGraphState({
      newConversations,
      chatContext: state.chatContext
    })

    return {
      chatContext: state.chatContext,
      newConversations
    }
  }
