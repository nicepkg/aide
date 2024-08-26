import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import type { FileInfo } from '@extension/webview-api/chat-context-processor/types/chat-context/file-context'
import type { IMentionStrategy } from '@webview/types/chat'

export class FileMentionStrategy implements IMentionStrategy {
  type = 'file'

  async getData(): Promise<FileInfo[]> {
    // 实现从 VSCode 扩展获取文件列表的逻辑
    // 这里需要与 VSCode 扩展通信
    return []
  }

  updateAttachments(
    data: FileInfo,
    currentAttachments: Attachments
  ): Partial<Attachments> {
    return {
      fileContext: {
        ...currentAttachments.fileContext,
        selectedFiles: [
          ...(currentAttachments.fileContext?.selectedFiles || []),
          data
        ]
      }
    }
  }
}
