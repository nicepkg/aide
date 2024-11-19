import { aidePaths } from '@extension/file-utils/paths'
import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base-strategy'
import {
  dispatchChatGraphState,
  type ChatGraphState,
  type CreateChatGraphNode
} from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/nodes/state'
import { DocCrawler } from '@extension/webview-api/chat-context-processor/utils/doc-crawler'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import { DocIndexer } from '@extension/webview-api/chat-context-processor/vectordb/doc-indexer'
import { docSitesDB } from '@extension/webview-api/lowdb/doc-sites-db'
import type { ToolMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import type { ConversationLog, LangchainTool } from '@shared/entities'
import { PluginId } from '@shared/plugins/base/types'
import { removeDuplicates, settledPromiseResults } from '@shared/utils/common'
import { produce } from 'immer'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import type { DocInfo, DocPluginLog, DocPluginState } from '../../types'

interface DocRetrieverToolResult {
  relevantDocs: DocInfo[]
}

export const createDocRetrieverTool = async (
  options: BaseStrategyOptions,
  state: ChatGraphState
) => {
  const lastConversation = state.chatContext.conversations.at(-1)

  const docPluginState = lastConversation?.pluginStates?.[PluginId.Doc] as
    | Partial<DocPluginState>
    | undefined

  if (!docPluginState?.allowSearchDocSiteNamesFromEditor?.length) return null

  const siteNames = removeDuplicates(
    docPluginState.allowSearchDocSiteNamesFromEditor
  )

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
          path: docSite.url
        }))
      )

      return docInfoResults
    })

    const results = await settledPromiseResults(docPromises)
    return results.flatMap(result => result)
  }

  return new DynamicStructuredTool({
    name: 'docRetriever',
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
              .enum(siteNames as unknown as [string, ...string[]])
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

export const createDocRetrieverNode: CreateChatGraphNode =
  options => async state => {
    const lastConversation = state.chatContext.conversations.at(-1)
    const logs: ConversationLog[] = []

    const docPluginState = lastConversation?.pluginStates?.[PluginId.Doc] as
      | Partial<DocPluginState>
      | undefined

    if (!docPluginState?.allowSearchDocSiteNamesFromEditor?.length) return {}

    const docRetrieverTool = await createDocRetrieverTool(options, state)

    if (!docRetrieverTool) return {}

    const tools: LangchainTool[] = [docRetrieverTool]
    const lastMessage = state.messages.at(-1)
    const toolCalls = findCurrentToolsCallParams(lastMessage, tools)

    if (!toolCalls.length) return {}

    const toolCallsPromises = toolCalls.map(async toolCall => {
      const toolMessage = (await docRetrieverTool.invoke(
        toolCall
      )) as ToolMessage

      const result = JSON.parse(
        toolMessage?.lc_kwargs.content
      ) as DocRetrieverToolResult

      lastConversation!.pluginStates![PluginId.Doc] = produce(
        lastConversation!.pluginStates![
          PluginId.Doc
        ] as Partial<DocPluginState>,
        (draft: Partial<DocPluginState>) => {
          if (!draft.relevantDocsFromAgent) {
            draft.relevantDocsFromAgent = []
          }

          draft.relevantDocsFromAgent.push(...result.relevantDocs)
        }
      )

      logs.push({
        id: uuidv4(),
        createdAt: Date.now(),
        pluginId: PluginId.Doc,
        title: 'Search documentation',
        relevantDocsFromAgent: result.relevantDocs
      } satisfies DocPluginLog)
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
