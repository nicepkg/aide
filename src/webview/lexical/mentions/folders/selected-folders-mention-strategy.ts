import {
  IMentionStrategy,
  MentionCategory,
  type Attachments,
  type FolderInfo
} from '@webview/types/chat'
import { removeDuplicates } from '@webview/utils/common'

export class SelectedFoldersMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Folders as const

  name = 'SelectedFoldersMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: FolderInfo[],
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    return {
      fileContext: {
        ...currentAttachments.fileContext,
        selectedFolders: removeDuplicates(
          [...(currentAttachments.fileContext?.selectedFolders || []), ...data],
          ['fullPath']
        )
      }
    }
  }
}
