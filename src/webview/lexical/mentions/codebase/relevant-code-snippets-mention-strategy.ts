import {
  MentionCategory,
  type Attachments,
  type IMentionStrategy
} from '@webview/types/chat'

export class RelevantCodeSnippetsMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Codebase as const

  name = 'RelevantCodeSnippetsMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: undefined,
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    return {
      codebaseContext: {
        ...currentAttachments.codebaseContext,
        enableTool: true
      }
    }
  }
}
