import type {
  WebContext,
  WebSearchResult
} from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { LangchainMessageContents } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { z } from 'zod'

import { splitter } from '../prompts'
import type { ContextProcessor } from '../types/context-processor'
import { createToolConfig, type ToolConfig } from '../types/tools'
import { searxngSearch } from '../utils/searxng-search'

export class WebProcessor implements ContextProcessor<WebContext> {
  async buildMessageContents(
    attachment: WebContext
  ): Promise<LangchainMessageContents> {
    return this.processWebContext(attachment)
  }

  async buildAgentTools(
    attachment: WebContext
  ): Promise<Array<ToolConfig<WebContext>>> {
    const { enableTool } = attachment
    if (!enableTool) return []

    const searchWebToolConfig = await createToolConfig({
      toolParams: {
        name: 'searchDoc',
        description: 'Search documentation',
        schema: z.object({
          keywords: z.string().describe('Keywords to search web')
        })
      },
      toolCallback: async ({ keywords }) => this.searchWeb({ keywords }),
      reBuildAttachment: async (toolResult, attachment: WebContext) => ({
        ...attachment,
        webSearchResults: toolResult ?? []
      })
    })

    return [searchWebToolConfig]
  }

  private async searchWeb({
    keywords
  }: {
    keywords: string
  }): Promise<WebSearchResult[]> {
    const searxngSearchResult = await searxngSearch(keywords)

    console.log('searxngSearchResult', searxngSearchResult)

    return [...searxngSearchResult.results]
  }

  private processWebContext(webContext: WebContext): LangchainMessageContents {
    let content = ''

    for (const result of webContext.webSearchResults) {
      content += `Title: ${result.title}\n`
      content += `URL: ${result.url}\n`
      content += `Content: ${result.content}\n\n`
    }

    content = content
      ? `
## Web Search Results
${content}
${splitter}
`
      : ''

    return [
      {
        type: 'text',
        text: content
      }
    ]
  }
}
