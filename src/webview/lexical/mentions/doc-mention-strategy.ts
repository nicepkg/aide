import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import type { DocInfo } from '@extension/webview-api/chat-context-processor/types/chat-context/doc-context'
import type { IMentionStrategy } from '@webview/types/chat'

export class DocMentionStrategy implements IMentionStrategy {
  type = 'doc'

  async getData(): Promise<DocInfo[]> {
    // 实现从 VSCode 扩展获取文档信息的逻辑
    return []
  }

  updateAttachments(
    data: DocInfo,
    currentAttachments: Attachments
  ): Partial<Attachments> {
    return {
      docContext: {
        ...currentAttachments.docContext,
        relevantDocs: [
          ...(currentAttachments.docContext?.relevantDocs || []),
          data
        ]
      }
    }
  }
}
