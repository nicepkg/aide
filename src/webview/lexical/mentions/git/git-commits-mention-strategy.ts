import {
  MentionCategory,
  type Attachments,
  type GitCommit,
  type IMentionStrategy
} from '@webview/types/chat'
import { removeDuplicates } from '@webview/utils/common'

export class GitCommitsMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Git as const

  name = 'GitCommitsMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: GitCommit[],
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    return {
      gitContext: {
        ...currentAttachments.gitContext,
        gitCommits: removeDuplicates(
          [...(currentAttachments.gitContext?.gitCommits || []), ...data],
          ['sha']
        )
      }
    }
  }
}
