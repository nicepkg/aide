import type { WebContext } from '../types/chat-context/web-context'
import type { ContextProcessor } from '../types/context-processor'
import type { LangchainMessageParams } from '../types/langchain-message'

export class WebProcessor implements ContextProcessor<WebContext> {
  async buildMessageParams(
    attachment: WebContext
  ): Promise<LangchainMessageParams> {
    return this.processWebContext(attachment)
  }

  private processWebContext(webContext: WebContext): LangchainMessageParams {
    let content = 'Web search results:\n\n'

    for (const result of webContext.searchResults) {
      content += `Title: ${result.title}\n`
      content += `URL: ${result.url}\n`
      content += `Summary: ${result.snippet}\n\n`
    }

    return content
  }
}
