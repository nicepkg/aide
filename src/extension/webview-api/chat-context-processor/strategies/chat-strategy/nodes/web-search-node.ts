import { createModelProvider } from '@extension/ai/helpers'
import type { WebSearchResult } from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { LangchainTool } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import { searxngSearch } from '@extension/webview-api/chat-context-processor/utils/searxng-search'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import type { Document } from '@langchain/core/documents'
import { HumanMessage, type ToolMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { settledPromiseResults } from '@shared/utils/common'
import { z } from 'zod'

import { ChatMessagesConstructor } from '../messages-constructors/chat-messages-constructor'
import {
  ChatGraphToolName,
  type ChatGraphNode,
  type ChatGraphState
} from './state'

interface WebSearchToolResult {
  relevantContent: string
  webSearchResults: WebSearchResult[]
}

const MAX_CONTENT_LENGTH = 16 * 1000

export const createWebSearchTool = async (state: ChatGraphState) => {
  const { chatContext } = state
  const { conversations } = chatContext
  const lastConversation = conversations.at(-1)
  const webContext = lastConversation?.attachments?.webContext

  if (!webContext || !webContext.enableTool) return null

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

    const chatMessagesConstructor = new ChatMessagesConstructor(
      state.chatContext
    )
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
    name: ChatGraphToolName.WebSearch,
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

export const webSearchNode: ChatGraphNode = async state => {
  const { messages, chatContext } = state
  const { conversations } = chatContext
  const lastConversation = conversations.at(-1)
  const webContext = lastConversation?.attachments?.webContext

  if (!webContext || !webContext.enableTool) return {}

  const webRetrieverTool = await createWebSearchTool(state)

  if (!webRetrieverTool) return {}

  const tools: LangchainTool[] = [webRetrieverTool]
  const lastMessage = messages.at(-1)
  const toolCalls = findCurrentToolsCallParams(lastMessage, tools)

  if (!toolCalls.length) return {}

  const toolCallsPromises = toolCalls.map(async toolCall => {
    const toolMessage = (await webRetrieverTool.invoke(toolCall)) as ToolMessage

    const result = JSON.parse(
      toolMessage?.lc_kwargs.content
    ) as WebSearchToolResult

    lastConversation.attachments!.docContext.relevantDocs = [
      ...lastConversation.attachments!.docContext.relevantDocs,
      {
        path: '',
        content: result.relevantContent
      }
    ]

    lastConversation.attachments!.webContext.webSearchResults = [
      ...lastConversation.attachments!.webContext.webSearchResults,
      ...result.webSearchResults
    ]
  })

  await settledPromiseResults(toolCallsPromises)

  return {
    chatContext
  }
}
