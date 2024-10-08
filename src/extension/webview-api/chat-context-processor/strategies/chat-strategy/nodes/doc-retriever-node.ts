import { aidePaths } from '@extension/file-utils/paths'
import { DocInfo } from '@extension/webview-api/chat-context-processor/types/chat-context/doc-context'
import type { LangchainTool } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { DocCrawler } from '@extension/webview-api/chat-context-processor/utils/doc-crawler'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import { DocIndexer } from '@extension/webview-api/chat-context-processor/vectordb/doc-indexer'
import { docSitesDB } from '@extension/webview-api/lowdb/doc-sites-db'
import type { ToolMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { removeDuplicates, settledPromiseResults } from '@shared/utils/common'
import { ContextInfoSource } from '@webview/types/chat'
import { z } from 'zod'

import {
  ChatGraphToolName,
  type ChatGraphNode,
  type ChatGraphState
} from './state'

interface DocRetrieverToolResult {
  relevantDocs: DocInfo[]
}

export const createDocRetrieverTool = async (state: ChatGraphState) => {
  const { chatContext } = state
  const { conversations } = chatContext
  const lastConversation = conversations.at(-1)
  const docContext = lastConversation?.attachments?.docContext

  if (!docContext) return null

  const { allowSearchDocSiteNames } = docContext

  if (!allowSearchDocSiteNames.length) return null
  const siteNames = allowSearchDocSiteNames.map(item => item.name)

  const getRelevantDocs = async (
    queryParts: { siteName: string; keywords: string[] }[]
  ): Promise<DocInfo[]> => {
    const docSites = await docSitesDB.getAll()

    const docPromises = queryParts.map(async ({ siteName, keywords }) => {
      const docSite = docSites.find(site => site.name === siteName)

      if (!docSite?.isIndexed || !siteNames.includes(siteName)) {
        return []
      }

      const docIndexer = new DocIndexer(
        DocCrawler.getDocCrawlerFolderPath(docSite.url),
        aidePaths.getGlobalLanceDbPath()
      )

      await docIndexer.initialize()

      const searchResults = await settledPromiseResults(
        keywords.map(keyword => docIndexer.searchSimilarRow(keyword))
      )

      const searchRows = removeDuplicates(
        searchResults.flatMap(result => result),
        ['fullPath']
      ).slice(0, 3)

      const docInfoResults = await settledPromiseResults(
        searchRows.map(async row => ({
          content: await docIndexer.getRowFileContent(row),
          path: docSite.url,
          source: ContextInfoSource.ToolNode
        }))
      )

      return docInfoResults
    })

    const results = await settledPromiseResults(docPromises)
    return results.flatMap(result => result)
  }

  return new DynamicStructuredTool({
    name: ChatGraphToolName.DocRetriever,
    description:
      'Search for relevant information in specified documentation sites. This tool can search across multiple doc sites, with multiple keywords for each site. Use this tool to find documentation on specific topics or understand how certain features are described in the documentation.',
    func: async ({ queryParts }): Promise<DocRetrieverToolResult> => ({
      relevantDocs: await getRelevantDocs(queryParts)
    }),
    schema: z.object({
      queryParts: z
        .array(
          z.object({
            siteName: z
              .enum(allowSearchDocSiteNames as unknown as [string, ...string[]])
              .describe('The name of the documentation site to search'),
            keywords: z
              .array(z.string())
              .describe(
                'List of keywords to search for in the specified doc site'
              )
          })
        )
        .describe(
          "The AI should break down the user's query into multiple parts, each targeting a specific doc site with relevant keywords. This allows for a more comprehensive search across multiple documentation sources."
        )
    })
  })
}

export const docRetrieverNode: ChatGraphNode = async state => {
  const { messages, chatContext } = state
  const { conversations } = chatContext
  const lastConversation = conversations.at(-1)
  const docContext = lastConversation?.attachments?.docContext

  if (!docContext) return {}

  const docRetrieverTool = await createDocRetrieverTool(state)

  if (!docRetrieverTool) return {}

  const tools: LangchainTool[] = [docRetrieverTool]
  const lastMessage = messages.at(-1)
  const toolCalls = findCurrentToolsCallParams(lastMessage, tools)

  if (!toolCalls.length) return {}

  const toolCallsPromises = toolCalls.map(async toolCall => {
    const toolMessage = (await docRetrieverTool.invoke(toolCall)) as ToolMessage

    const result = JSON.parse(
      toolMessage?.lc_kwargs.content
    ) as DocRetrieverToolResult

    lastConversation.attachments!.docContext.relevantDocs = [
      ...lastConversation.attachments!.docContext.relevantDocs,
      ...result.relevantDocs
    ]
  })

  await settledPromiseResults(toolCallsPromises)

  return {
    chatContext
  }
}
