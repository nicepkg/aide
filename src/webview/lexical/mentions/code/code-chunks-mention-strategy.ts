import {
  MentionCategory,
  type Attachments,
  type CodeChunk,
  type IMentionStrategy
} from '@webview/types/chat'
import { removeDuplicates } from '@webview/utils/common'

export class CodeChunksMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Code as const

  name = 'CodeChunksMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: CodeChunk,
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    return {
      codeContext: {
        ...currentAttachments.codeContext,
        codeChunks: removeDuplicates(
          [...(currentAttachments.codeContext?.codeChunks || []), data],
          ['relativePath', 'code']
        )
      }
    }
  }
}
