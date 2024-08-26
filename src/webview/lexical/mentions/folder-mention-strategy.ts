import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import type { FolderInfo } from '@extension/webview-api/chat-context-processor/types/chat-context/file-context'
import type { IMentionStrategy } from '@webview/types/chat'

export class FolderMentionStrategy implements IMentionStrategy {
  type = 'folder'

  async getData(): Promise<FolderInfo[]> {
    // 实现从 VSCode 扩展获取文件夹列表的逻辑
    return []
  }

  updateAttachments(
    data: FolderInfo,
    currentAttachments: Attachments
  ): Partial<Attachments> {
    return {
      fileContext: {
        ...currentAttachments.fileContext,
        selectedFolders: [
          ...(currentAttachments.fileContext?.selectedFolders || []),
          data
        ]
      }
    }
  }
}
