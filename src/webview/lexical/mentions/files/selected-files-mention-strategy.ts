import { removeDuplicates } from '@shared/utils/common'
import {
  IMentionStrategy,
  MentionCategory,
  type Attachments,
  type FileInfo
} from '@webview/types/chat'

export class SelectedFilesMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Files as const

  name = 'SelectedFilesMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: FileInfo | FileInfo[],
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    const files = Array.isArray(data) ? data : [data]

    return {
      fileContext: {
        ...currentAttachments.fileContext,
        selectedFiles: removeDuplicates(
          [...(currentAttachments.fileContext?.selectedFiles || []), ...files],
          ['fullPath']
        )
      }
    }
  }
}
