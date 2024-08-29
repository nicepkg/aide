import { z } from 'zod'

import type {
  WebContext,
  WebSearchResult
} from '../types/chat-context/web-context'
import type { ContextProcessor } from '../types/context-processor'
import type { LangchainMessageParams } from '../types/langchain-message'
import { createToolConfig, type ToolConfig } from '../types/langchain-tool'

export class WebProcessor implements ContextProcessor<WebContext> {
  async buildMessageParams(
    attachment: WebContext
  ): Promise<LangchainMessageParams> {
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
        searchResults: toolResult ?? []
      })
    })

    return [searchWebToolConfig]
  }

  private async searchWeb({
    keywords
  }: {
    keywords: string
  }): Promise<WebSearchResult[]> {
    console.log('Searching web:', keywords)
    // TODO: Implement searchDoc
    return []
  }

  private processWebContext(webContext: WebContext): LangchainMessageParams {
    let content = 'Web search results:\n\n'

    for (const result of webContext.webSearchResults) {
      content += `Title: ${result.title}\n`
      content += `URL: ${result.url}\n`
      content += `Summary: ${result.snippet}\n\n`
    }

    return content
  }
}
