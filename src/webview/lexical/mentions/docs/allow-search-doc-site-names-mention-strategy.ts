import { removeDuplicates } from '@shared/utils/common'
import {
  IMentionStrategy,
  MentionCategory,
  type Attachments,
  type DocSite
} from '@webview/types/chat'

export class AllowSearchDocSiteNamesToolMentionStrategy
  implements IMentionStrategy
{
  category = MentionCategory.Docs as const

  name = 'AllowSearchDocSiteNamesToolMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: DocSite | DocSite[],
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    const sites = Array.isArray(data) ? data : [data]

    return {
      docContext: {
        ...currentAttachments.docContext,
        allowSearchDocSiteNames: removeDuplicates([
          ...(currentAttachments.docContext?.allowSearchDocSiteNames || []),
          ...sites.map(site => site.name)
        ])
      }
    }
  }
}
