import type { CodeSnippet } from '@extension/webview-api/chat-context-processor/types/chat-context/codebase-context'
import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import type { IMentionStrategy } from '@webview/types/chat'

export class CodeSnippetMentionStrategy implements IMentionStrategy {
  type = 'codeSnippet'

  async getData(): Promise<CodeSnippet[]> {
    // 实现从 VSCode 扩展获取代码片段的逻辑
    return []
  }

  updateAttachments(
    data: CodeSnippet,
    currentAttachments: Attachments
  ): Partial<Attachments> {
    return {
      codebaseContext: {
        ...currentAttachments.codebaseContext,
        relevantSnippets: [
          ...(currentAttachments.codebaseContext?.relevantSnippets || []),
          data
        ]
      }
    }
  }
}
