import {
  MentionCategory,
  type Attachments,
  type GitPullRequest,
  type IMentionStrategy
} from '@webview/types/chat'
import { removeDuplicates } from '@webview/utils/common'

export class GitPullRequestsMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Git as const

  name = 'GitPullRequestsMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: GitPullRequest | GitPullRequest[],
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    const pullRequests = Array.isArray(data) ? data : [data]

    return {
      gitContext: {
        ...currentAttachments.gitContext,
        gitPullRequests: removeDuplicates(
          [
            ...(currentAttachments.gitContext?.gitPullRequests || []),
            ...pullRequests
          ],
          ['id']
        )
      }
    }
  }
}
