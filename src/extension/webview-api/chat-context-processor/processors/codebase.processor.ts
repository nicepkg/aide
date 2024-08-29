import type { ChatContext } from '../types/chat-context'
import type { CodebaseContext } from '../types/chat-context/codebase-context'
import type { Conversation } from '../types/chat-context/conversation'
import type { ContextProcessor } from '../types/context-processor'
import type { LangchainMessageParams } from '../types/langchain-message'
import { formatCodeSnippet } from '../utils/code-snippet-formatter'

export class CodebaseProcessor implements ContextProcessor<CodebaseContext> {
  async buildMessageParams(
    attachment: CodebaseContext,
    conversation: Conversation,
    context: ChatContext
  ): Promise<LangchainMessageParams> {
    const isLastConversation =
      context.conversations.lastIndexOf(conversation) ===
      context.conversations.length - 1

    return this.processCodebaseContext(attachment, isLastConversation)
  }

  private processCodebaseContext(
    codebaseContext: CodebaseContext,
    isLastConversation: boolean
  ): LangchainMessageParams {
    let content = 'Relevant codebase snippets:\n\n'

    for (const chunk of codebaseContext.relevantCodeSnippets) {
      content += formatCodeSnippet(
        {
          relativePath: chunk.relativePath,
          code: chunk.code
        },
        isLastConversation
      )
    }

    return content
  }
}
