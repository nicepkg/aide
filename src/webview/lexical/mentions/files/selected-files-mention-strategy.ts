import {
  IMentionStrategy,
  MentionCategory,
  type Attachments,
  type FileInfo
} from '@webview/types/chat'
import { removeDuplicates } from '@webview/utils/common'

export class SelectedFilesMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Files as const

  name = 'SelectedFilesMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: FileInfo[],
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    return {
      fileContext: {
        ...currentAttachments.fileContext,
        selectedFiles: removeDuplicates(
          [...(currentAttachments.fileContext?.selectedFiles || []), ...data],
          ['fullPath']
        )
      }
    }
  }
}
