import {
  IMentionStrategy,
  MentionCategory,
  type Attachments
} from '@webview/types/chat'

export class EnableWebToolMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Web as const

  name = 'EnableWebToolMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: undefined,
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    return {
      webContext: {
        ...currentAttachments.webContext,
        enableTool: true
      }
    }
  }
}
