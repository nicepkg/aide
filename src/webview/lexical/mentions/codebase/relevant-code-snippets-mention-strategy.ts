import {
  MentionCategory,
  type Attachments,
  type CodeSnippet,
  type IMentionStrategy
} from '@webview/types/chat'
import { removeDuplicates } from '@webview/utils/common'

export class RelevantCodeSnippetsMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Codebase as const

  name = 'RelevantCodeSnippetsMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: CodeSnippet[],
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    return {
      codebaseContext: {
        ...currentAttachments.codebaseContext,
        relevantCodeSnippets: removeDuplicates(
          [
            ...(currentAttachments.codebaseContext?.relevantCodeSnippets || []),
            ...data
          ],
          ['fullPath', 'code']
        )
      }
    }
  }
}
