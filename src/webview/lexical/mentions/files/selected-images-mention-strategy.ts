import { removeDuplicates } from '@shared/utils/common'
import {
  IMentionStrategy,
  MentionCategory,
  type Attachments,
  type ImageInfo
} from '@webview/types/chat'

export class SelectedImagesMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Files as const

  name = 'SelectedImagesMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: ImageInfo | ImageInfo[],
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    const imgs = Array.isArray(data) ? data : [data]

    return {
      fileContext: {
        ...currentAttachments.fileContext,
        selectedImages: removeDuplicates(
          [...(currentAttachments.fileContext?.selectedImages || []), ...imgs],
          ['url']
        )
      }
    }
  }
}
