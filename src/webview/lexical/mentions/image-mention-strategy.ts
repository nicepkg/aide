import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import type { ImageInfo } from '@extension/webview-api/chat-context-processor/types/chat-context/file-context'
import type { IMentionStrategy } from '@webview/types/chat'

export class ImageMentionStrategy implements IMentionStrategy {
  type = 'image'

  async getData(): Promise<ImageInfo[]> {
    // 实现从 VSCode 扩展获取图片列表的逻辑
    return []
  }

  updateAttachments(
    data: ImageInfo,
    currentAttachments: Attachments
  ): Partial<Attachments> {
    return {
      fileContext: {
        ...currentAttachments.fileContext,
        selectedImages: [
          ...(currentAttachments.fileContext?.selectedImages || []),
          data
        ]
      }
    }
  }
}
