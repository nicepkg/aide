import {
  IMentionStrategy,
  MentionCategory,
  type Attachments
} from '@webview/types/chat'
import { removeDuplicates } from '@webview/utils/common'

export class AllowSearchDocSiteUrlsToolMentionStrategy
  implements IMentionStrategy
{
  category = MentionCategory.Docs as const

  name = 'AllowSearchDocSiteUrlsToolMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: string | string[],
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    const urls = Array.isArray(data) ? data : [data]

    return {
      docContext: {
        ...currentAttachments.docContext,
        enableTool: true,
        allowSearchDocSiteUrls: removeDuplicates([
          ...(currentAttachments.docContext?.allowSearchDocSiteUrls || []),
          ...urls
        ])
      }
    }
  }
}
