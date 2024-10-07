import { removeDuplicates } from '@shared/utils/common'
import {
  MentionCategory,
  type Attachments,
  type CodeChunk,
  type IMentionStrategy
} from '@webview/types/chat'

export class CodeChunksMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Code as const

  name = 'CodeChunksMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: CodeChunk | CodeChunk[],
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    const codeChunks = Array.isArray(data) ? data : [data]

    return {
      codeContext: {
        ...currentAttachments.codeContext,
        codeChunks: removeDuplicates(
          [
            ...(currentAttachments.codeContext?.codeChunks || []),
            ...codeChunks
          ],
          ['relativePath', 'code']
        )
      }
    }
  }
}
