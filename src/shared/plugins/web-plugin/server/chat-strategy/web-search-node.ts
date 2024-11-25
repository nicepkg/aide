import { ModelProviderFactory } from '@extension/ai/model-providers/helpers/factory'
import { logger } from '@extension/logger'
import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base-strategy'
import { ChatMessagesConstructor } from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/messages-constructors/chat-messages-constructor'
import {
  dispatchChatGraphState,
  type ChatGraphState,
  type CreateChatGraphNode
} from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/nodes/state'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import { searxngSearch } from '@extension/webview-api/chat-context-processor/utils/searxng-search'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import type { Document } from '@langchain/core/documents'
import { HumanMessage, type ToolMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { FeatureModelSettingKey } from '@shared/entities'
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
    const searxngSearchResult = await searxngSearch(keywords, {
      abortController: state.abortController
    })
    const urls = searxngSearchResult.results.map(result => result.url)

    const docsLoadResult = await settledPromiseResults(
      urls.map(url => new CheerioWebBaseLoader(url).load())
    )

    const docs: Document<Record<string, any>>[] = docsLoadResult.flat()

    const docsContent = docs
      .map(doc => doc.pageContent)
      .join('\n')
      .slice(0, MAX_CONTENT_LENGTH)

    if (!docsContent) {
      logger.warn('No content found in web search results', {
        keywords,
        docs
      })
      return { relevantContent: '', webSearchResults: [] }
    }
    const chatMessagesConstructor = new ChatMessagesConstructor({
      ...options,
      chatContext: state.chatContext
    })
    const messagesFromChatContext =
      await chatMessagesConstructor.constructMessages()

    const modelProvider = await ModelProviderFactory.getModelProvider(
      FeatureModelSettingKey.Chat
    )
    const aiModel = await modelProvider.createLangChainModel()

    const response = await aiModel
      .bind({ signal: state.abortController?.signal })
      .invoke([
        ...messagesFromChatContext.slice(-2),
        new HumanMessage({
          content: `
You are an expert information analyst. Your task is to process web search results and create a high-quality, focused summary that will be used in a subsequent AI conversation. Follow these critical guidelines:

1. RELEVANCE & FOCUS
- Identify and extract ONLY information that directly addresses the user's query
- Eliminate tangential or loosely related content
- Preserve technical details and specific examples when relevant

2. INFORMATION QUALITY
- Prioritize factual, verifiable information
- Include specific technical details, numbers, or metrics when present
- Maintain technical accuracy in specialized topics

3. STRUCTURE & CLARITY
- Present information in a logical, well-structured format
- Use clear, precise language
- Preserve important technical terms and concepts

4. BALANCED PERSPECTIVE
- Include multiple viewpoints when present
- Note any significant disagreements or contradictions
- Indicate if information seems incomplete or uncertain

5. CONTEXT PRESERVATION
- Maintain crucial context that affects meaning
- Include relevant dates or version information for technical content
- Preserve attribution for significant claims or findings

Here's the content to analyze:

"""
${docsContent}
"""

Provide a focused, technical summary that will serve as high-quality context for the next phase of AI conversation.`
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
    description:
      'IMPORTANT: Proactively use this web search tool whenever you:\n' +
      '1. Need to verify or update your knowledge about recent developments, versions, or current facts\n' +
      '2. Are unsure about specific technical details or best practices\n' +
      '3. Need real-world examples or implementation details\n' +
      '4. Encounter questions about:\n' +
      '   - Current events or recent updates\n' +
      '   - Latest software versions or features\n' +
      '   - Modern best practices or trends\n' +
      '   - Specific technical implementations\n' +
      '5. Want to provide evidence-based recommendations\n\n' +
      'DO NOT rely solely on your training data when users ask about:\n' +
      '- Recent technologies or updates\n' +
      '- Current best practices\n' +
      '- Specific implementation details\n' +
      '- Version-specific features or APIs\n' +
      'Instead, use this tool to get up-to-date information.',
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

    dispatchChatGraphState({
      newConversations,
      chatContext: state.chatContext
    })

    return {
      chatContext: state.chatContext,
      newConversations
    }
  }
