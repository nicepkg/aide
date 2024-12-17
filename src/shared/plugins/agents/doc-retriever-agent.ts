import { aidePaths } from '@extension/file-utils/paths'
import { BaseAgent } from '@extension/webview-api/chat-context-processor/strategies/base/base-agent'
import type { BaseGraphState } from '@extension/webview-api/chat-context-processor/strategies/base/base-state'
import { DocCrawler } from '@extension/webview-api/chat-context-processor/utils/doc-crawler'
import { DocIndexer } from '@extension/webview-api/chat-context-processor/vectordb/doc-indexer'
import { docSitesDB } from '@extension/webview-api/lowdb/doc-sites-db'
import { removeDuplicates, settledPromiseResults } from '@shared/utils/common'
import { z } from 'zod'

import type { DocInfo } from '../doc-plugin/types'
import { docRetrieverAgentName } from './agent-names'

export class DocRetrieverAgent extends BaseAgent<
  BaseGraphState,
  { allowSearchDocSiteNames: string[] }
> {
  static name = docRetrieverAgentName

  name = DocRetrieverAgent.name

  logTitle = 'Search documentation'

  description =
    'Search for relevant information in specified documentation sites.'

  inputSchema = z.object({
    queryParts: z
      .array(
        z.object({
          siteName: z
            .string()
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

  outputSchema = z.object({
    relevantDocs: z.array(
      z.object({
        content: z.string(),
        path: z.string()
      }) satisfies z.ZodType<DocInfo>
    )
  })

  async execute(input: z.infer<typeof this.inputSchema>) {
    const { allowSearchDocSiteNames } = this.context.createToolOptions
    const docSites = await docSitesDB.getAll()

    const docPromises = input.queryParts.map(async ({ siteName, keywords }) => {
      const docSite = docSites.find(site => site.name === siteName)

      if (!docSite?.isIndexed || !allowSearchDocSiteNames.includes(siteName)) {
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
    return {
      relevantDocs: results.flatMap(result => result)
    }
  }
}
