import type {
  DocContext,
  DocInfo
} from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { LangchainMessageContents } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { z } from 'zod'

import { splitter } from '../prompts'
import type { ContextProcessor } from '../types/context-processor'
import { createToolConfig, type ToolConfig } from '../types/tools'

export class DocProcessor implements ContextProcessor<DocContext> {
  async buildMessageContents(
    attachment: DocContext
  ): Promise<LangchainMessageContents> {
    return this.processDocContext(attachment)
  }

  async buildAgentTools(
    attachment: DocContext
  ): Promise<Array<ToolConfig<DocContext>>> {
    const { enableTool, allowSearchDocSiteUrls } = attachment
    if (!enableTool || allowSearchDocSiteUrls?.length === 0) return []

    const searchDocToolConfig = await createToolConfig({
      toolParams: {
        name: 'searchDoc',
        description: 'Search documentation',
        schema: z.object({
          searchSiteUrl: z
            .enum(allowSearchDocSiteUrls as [string, ...string[]])
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

  private processDocContext(docContext: DocContext): LangchainMessageContents {
    let content = ''

    for (const doc of docContext.relevantDocs) {
      content += `Title: ${doc.title}\n`
      if (doc.url) content += `URL: ${doc.url}\n`
      content += `Content:\n${doc.content}\n\n`
    }

    content = content
      ? `
## Relevant documentation
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
