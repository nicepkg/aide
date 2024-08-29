import { z } from 'zod'

import { DocContext, type DocInfo } from '../types/chat-context/doc-context'
import type { ContextProcessor } from '../types/context-processor'
import type { LangchainMessageParams } from '../types/langchain-message'
import { createToolConfig, type ToolConfig } from '../types/langchain-tool'

export class DocProcessor implements ContextProcessor<DocContext> {
  async buildMessageParams(
    attachment: DocContext
  ): Promise<LangchainMessageParams> {
    return this.processDocContext(attachment)
  }

  async buildAgentTools(
    attachment: DocContext
  ): Promise<Array<ToolConfig<DocContext>>> {
    const { enableTool, allowSearchDocSiteUrls: allowSearchSiteUrls } =
      attachment
    if (!enableTool || allowSearchSiteUrls?.length === 0) return []

    const searchDocToolConfig = await createToolConfig({
      toolParams: {
        name: 'searchDoc',
        description: 'Search documentation',
        schema: z.object({
          searchSiteUrl: z
            .enum(allowSearchSiteUrls as [string, ...string[]])
            .describe('URL of the site to search documentation'),
          keywords: z.string().describe('Keywords to search documentation')
        })
      },
      toolCallback: async ({ searchSiteUrl, keywords }) =>
        this.searchDoc({ searchSiteUrl, keywords }),
      reBuildAttachment: async (toolResult, attachment: DocContext) => ({
        ...attachment,
        relevantDocs: toolResult ?? []
      })
    })

    return [searchDocToolConfig]
  }

  private async searchDoc({
    searchSiteUrl,
    keywords
  }: {
    searchSiteUrl: string
    keywords: string
  }): Promise<DocInfo[]> {
    console.log('Searching documentation:', searchSiteUrl, keywords)
    // TODO: Implement searchDoc
    return []
  }

  private processDocContext(docContext: DocContext): LangchainMessageParams {
    let content = 'Relevant documentation:\n\n'

    for (const doc of docContext.relevantDocs) {
      content += `Title: ${doc.title}\n`
      if (doc.url) content += `URL: ${doc.url}\n`
      content += `Content:\n${doc.content}\n\n`
    }

    return content
  }
}
