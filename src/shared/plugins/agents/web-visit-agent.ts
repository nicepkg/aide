import { BaseAgent } from '@extension/webview-api/chat-context-processor/strategies/base/base-agent'
import type { BaseGraphState } from '@extension/webview-api/chat-context-processor/strategies/base/base-state'
import { DocCrawler } from '@extension/webview-api/chat-context-processor/utils/doc-crawler'
import { settledPromiseResults } from '@shared/utils/common'
import { z } from 'zod'

import { webVisitAgentName } from './agent-names'

export class WebVisitAgent extends BaseAgent<
  BaseGraphState,
  { enableWebVisitAgent: boolean }
> {
  static name = webVisitAgentName

  name = WebVisitAgent.name

  logTitle = 'Visit web'

  description =
    'A tool for visiting and extracting content from web pages. Use this tool when you need to:\n' +
    '1. Analyze specific webpage content in detail\n' +
    '2. Extract information from known URLs\n' +
    '3. Compare content across multiple web pages\n' +
    '4. Verify or fact-check information from web sources\n' +
    'Note: Only use this for specific URLs you want to analyze, not for general web searches.'

  inputSchema = z.object({
    urls: z
      .array(z.string().url())
      .describe(
        'An array of URLs to visit and retrieve content from. Each URL should be a valid web address.'
      )
  })

  outputSchema = z.object({
    contents: z.array(
      z.object({
        content: z.string(),
        url: z.string()
      })
    )
  })

  async execute(input: z.infer<typeof this.inputSchema>) {
    const { enableWebVisitAgent } = this.context.createToolOptions

    if (!enableWebVisitAgent) {
      return { contents: [] }
    }

    const docCrawler = new DocCrawler(input.urls[0]!)
    const contents = await settledPromiseResults(
      input.urls.map(async url => ({
        url,
        content:
          (await docCrawler.getPageContent(url)) || 'Failed to retrieve content'
      }))
    )

    return { contents }
  }
}
