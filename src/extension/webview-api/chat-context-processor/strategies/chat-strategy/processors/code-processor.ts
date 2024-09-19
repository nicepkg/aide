import type {
  ChatContext,
  CodeContext,
  Conversation
} from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { LangchainMessageContents } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { formatCodeSnippet } from '@extension/webview-api/chat-context-processor/utils/code-snippet-formatter'

import type { ContextProcessor } from '../types/context-processor'

export class CodeProcessor implements ContextProcessor<CodeContext> {
  async buildMessageContents(
    attachment: CodeContext,
    conversation: Conversation,
    context: ChatContext
  ): Promise<LangchainMessageContents> {
    const isLastConversation =
      context.conversations.lastIndexOf(conversation) ===
      context.conversations.length - 1

    return this.processCodeContext(attachment, isLastConversation)
  }

  private processCodeContext(
    codeContext: CodeContext,
    isLastConversation: boolean
  ): LangchainMessageContents {
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

    return [
      {
        type: 'text',
        text: content
      }
    ]
  }
}
