import type {
  ChatContext,
  CodebaseContext,
  Conversation
} from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { LangchainMessageContents } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { formatCodeSnippet } from '@extension/webview-api/chat-context-processor/utils/code-snippet-formatter'

import { splitter } from '../prompts'
import type { ContextProcessor } from '../types/context-processor'

export class CodebaseProcessor implements ContextProcessor<CodebaseContext> {
  async buildMessageContents(
    attachment: CodebaseContext,
    conversation: Conversation,
    context: ChatContext
  ): Promise<LangchainMessageContents> {
    const isLastConversation =
      context.conversations.lastIndexOf(conversation) ===
      context.conversations.length - 1

    return this.processCodebaseContext(attachment, isLastConversation)
  }

  private processCodebaseContext(
    codebaseContext: CodebaseContext,
    isLastConversation: boolean
  ): LangchainMessageContents {
    let content = ''

    for (const chunk of codebaseContext.relevantCodeSnippets) {
      content += formatCodeSnippet(
        {
          relativePath: chunk.relativePath,
          code: chunk.code
        },
        isLastConversation
      )
    }

    content = content
      ? `
## Potentially Relevant Code Snippets from the current Codebase
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
