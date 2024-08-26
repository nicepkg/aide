import type { ChatContext } from '../types/chat-context'
import type { CodeContext } from '../types/chat-context/code-context'
import type { Conversation } from '../types/chat-context/conversation'
import type { ContextProcessor } from '../types/context-processor'
import type { LangchainMessageParams } from '../types/langchain-message'
import { formatCodeSnippet } from '../utils/code-snippet-formatter'

export class CodeProcessor implements ContextProcessor<CodeContext> {
  async buildMessageParams(
    attachment: CodeContext,
    conversation: Conversation,
    context: ChatContext
  ): Promise<LangchainMessageParams> {
    const isLastConversation =
      context.conversations.lastIndexOf(conversation) ===
      context.conversations.length - 1

    return this.processCodeContext(attachment, isLastConversation)
  }

  private processCodeContext(
    codeContext: CodeContext,
    isLastConversation: boolean
  ): LangchainMessageParams {
    let content = ''

    // Process codeChunks
    for (const chunk of codeContext.codeChunks) {
      content += formatCodeSnippet(
        {
          relativePath: chunk.relativePath,
          code: chunk.code
        },
        isLastConversation
      )
    }

    // Process tmpCodeChunk
    for (const tmpChunk of codeContext.tmpCodeChunk) {
      content += formatCodeSnippet(
        {
          language: tmpChunk.language,
          code: tmpChunk.code
        },
        isLastConversation
      )
    }

    return content
  }
}
