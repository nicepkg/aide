import type { CodeChunk } from '@extension/webview-api/chat-context-processor/types/chat-context/code-context'
import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import type { IMentionStrategy } from '@webview/types/chat'

export class CodeChunkMentionStrategy implements IMentionStrategy {
  type = 'codeChunk'

  async getData(): Promise<CodeChunk[]> {
    // 实现从 VSCode 扩展获取代码块的逻辑
    return []
  }

  updateAttachments(
    data: CodeChunk,
    currentAttachments: Attachments
  ): Partial<Attachments> {
    return {
      codeContext: {
        ...currentAttachments.codeContext,
        codeChunks: [
          ...(currentAttachments.codeContext?.codeChunks || []),
          data
        ]
      }
    }
  }
}
