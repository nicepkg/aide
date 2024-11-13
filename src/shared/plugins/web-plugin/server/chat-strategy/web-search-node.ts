import { createModelProvider } from '@extension/ai/helpers'
import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base-strategy'
import { ChatMessagesConstructor } from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/messages-constructors/chat-messages-constructor'
import {
  type ChatGraphState,
  type CreateChatGraphNode
} from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/nodes/state'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import { searxngSearch } from '@extension/webview-api/chat-context-processor/utils/searxng-search'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import type { Document } from '@langchain/core/documents'
import { HumanMessage, type ToolMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import type { ConversationLog, LangchainTool } from '@shared/entities'
import { PluginId } from '@shared/plugins/base/types'
import { settledPromiseResults } from '@shared/utils/common'
import { produce } from 'immer'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import type { WebDocInfo, WebPluginLog, WebPluginState } from '../../types'

interface WebSearchToolResult {
  relevantContent: string
  webSearchResults: WebDocInfo[]
}

const MAX_CONTENT_LENGTH = 16 * 1000

export const createWebSearchTool = async (
  options: BaseStrategyOptions,
  state: ChatGraphState
) => {
  const { conversations } = state.chatContext
  const lastConversation = conversations.at(-1)

  const webPluginState = lastConversation?.pluginStates?.[PluginId.Web] as
    | Partial<WebPluginState>
    | undefined

  if (!webPluginState?.enableWebSearchAgent) return null

  const getRelevantContentAndSearchResults = async (
    state: ChatGraphState,
    keywords: string
  ) => {
    const searxngSearchResult = await searxngSearch(keywords)
    const urls = searxngSearchResult.results.map(result => result.url)

    const docsLoadResult = await settledPromiseResults(
      urls.map(url => new CheerioWebBaseLoader(url).load())
    )

    const docs: Document<Record<string, any>>[] = docsLoadResult.flat()

    const docsContent = docs
      .map(doc => doc.pageContent)
      .join('\n')
      .slice(0, MAX_CONTENT_LENGTH)

    const chatMessagesConstructor = new ChatMessagesConstructor({
      ...options,
      chatContext: state.chatContext
    })
    const messagesFromChatContext =
      await chatMessagesConstructor.constructMessages()

    const modelProvider = await createModelProvider()
    const aiModelAbortController = new AbortController()
    const aiModel = await modelProvider.getModel()

    const response = await aiModel
      .bind({ signal: aiModelAbortController.signal })
      .invoke([
        ...messagesFromChatContext.slice(-2),
        new HumanMessage({
          content: `
I've conducted a web search based on the user's query. Below is the content from various web pages. Your task is to:

1. Analyze this content and identify the most relevant information related to the user's question.
2. Summarize the key points that directly address the user's query.
3. If there are multiple perspectives or conflicting information, present them objectively.
4. Exclude any irrelevant or off-topic information.
5. Ensure the summary is concise yet comprehensive, focusing on quality over quantity.

Here's the content from the web search:

"""
${docsContent}
"""

Please provide a relevant and focused summary based on this content and the user's question.
          `
        })
      ])

    return {
      relevantContent:
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content),
      webSearchResults: searxngSearchResult.results
    }
  }

  return new DynamicStructuredTool({
    name: 'webSearch',
    description: 'search web',
    func: async ({ keywords }): Promise<WebSearchToolResult> => {
      const { relevantContent, webSearchResults } =
        await getRelevantContentAndSearchResults(state, keywords)

      return {
        relevantContent,
        webSearchResults
      }
    },
    schema: z.object({
      keywords: z.string().describe('Keywords to search web')
    })
  })
}

export const createWebSearchNode: CreateChatGraphNode =
  options => async state => {
    const { conversations } = state.chatContext
    const lastConversation = conversations.at(-1)
    const webPluginState = lastConversation?.pluginStates?.[PluginId.Web] as
      | Partial<WebPluginState>
      | undefined
    const logs: ConversationLog[] = []

    if (!webPluginState?.enableWebSearchAgent) return {}

    const webRetrieverTool = await createWebSearchTool(options, state)

    if (!webRetrieverTool) return {}

    const tools: LangchainTool[] = [webRetrieverTool]
    const lastMessage = state.messages.at(-1)
    const toolCalls = findCurrentToolsCallParams(lastMessage, tools)

    if (!toolCalls.length) return {}

    const toolCallsPromises = toolCalls.map(async toolCall => {
      const toolMessage = (await webRetrieverTool.invoke(
        toolCall
      )) as ToolMessage

      const result = JSON.parse(
        toolMessage?.lc_kwargs.content
      ) as WebSearchToolResult

      lastConversation!.pluginStates![PluginId.Web] = produce(
        lastConversation!.pluginStates![
          PluginId.Web
        ] as Partial<WebPluginState>,
        (draft: Partial<WebPluginState>) => {
          if (!draft.webSearchAsDocFromAgent) {
            draft.webSearchAsDocFromAgent = []
          }

          if (!draft.webSearchResultsFromAgent) {
            draft.webSearchResultsFromAgent = []
          }

          draft.webSearchAsDocFromAgent.push({
            url: '',
            content: result.relevantContent
          })

          draft.webSearchResultsFromAgent.push(...result.webSearchResults)
        }
      )

      logs.push({
        id: uuidv4(),
        createdAt: Date.now(),
        pluginId: PluginId.Web,
        title: 'Search web',
        webSearchResultsFromAgent: result.webSearchResults
      } satisfies WebPluginLog)
    })

    await settledPromiseResults(toolCallsPromises)

    const newConversations = produce(state.newConversations, draft => {
      draft.at(-1)!.logs.push(...logs)
    })

    return {
      chatContext: state.chatContext,
      newConversations
    }
  }
