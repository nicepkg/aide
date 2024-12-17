import { ModelProviderFactory } from '@extension/ai/model-providers/helpers/factory'
import { logger } from '@extension/logger'
import { BaseAgent } from '@extension/webview-api/chat-context-processor/strategies/base/base-agent'
import type { BaseGraphState } from '@extension/webview-api/chat-context-processor/strategies/base/base-state'
import { ChatMessagesConstructor } from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/messages-constructors/chat-messages-constructor'
import { searxngSearch } from '@extension/webview-api/chat-context-processor/utils/searxng-search'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import type { Document } from '@langchain/core/documents'
import { HumanMessage } from '@langchain/core/messages'
import { settledPromiseResults } from '@shared/utils/common'
import { z } from 'zod'

import { webSearchAgentName } from './agent-names'

const MAX_CONTENT_LENGTH = 16 * 1000

export class WebSearchAgent extends BaseAgent<
  BaseGraphState,
  { enableWebSearchAgent: boolean }
> {
  static name = webSearchAgentName

  name = WebSearchAgent.name

  logTitle = 'Search web'

  description =
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
    'Instead, use this tool to get up-to-date information.'

  inputSchema = z.object({
    keywords: z.string().describe('Keywords to search web')
  })

  outputSchema = z.object({
    relevantContent: z.string(),
    webSearchResults: z.array(
      z.object({
        content: z.string(),
        url: z.string()
      })
    )
  })

  async execute(input: z.infer<typeof this.inputSchema>) {
    const { enableWebSearchAgent } = this.context.createToolOptions

    if (!enableWebSearchAgent) {
      return { relevantContent: '', webSearchResults: [] }
    }

    const searxngSearchResult = await searxngSearch(input.keywords, {
      abortController: this.context.state.abortController
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
        keywords: input.keywords,
        docs
      })
      return { relevantContent: '', webSearchResults: [] }
    }

    const chatMessagesConstructor = new ChatMessagesConstructor({
      ...this.context.strategyOptions,
      chatContext: this.context.state.chatContext
    })
    const messagesFromChatContext =
      await chatMessagesConstructor.constructMessages()

    const modelProvider =
      await ModelProviderFactory.getModelProviderForChatContext(
        this.context.state.chatContext
      )
    const aiModel = await modelProvider.createLangChainModel()

    const response = await aiModel
      .bind({ signal: this.context.state.abortController?.signal })
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
}
