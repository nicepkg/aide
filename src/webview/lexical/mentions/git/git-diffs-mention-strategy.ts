import { removeDuplicates } from '@shared/utils/common'
import {
  MentionCategory,
  type Attachments,
  type GitDiff,
  type IMentionStrategy
} from '@webview/types/chat'

export class GitDiffsMentionStrategy implements IMentionStrategy {
  category = MentionCategory.Git as const

  name = 'GitDiffsMentionStrategy' as const

  async buildNewAttachmentsAfterAddMention(
    data: GitDiff | GitDiff[],
    currentAttachments: Attachments
  ): Promise<Partial<Attachments>> {
    const diffs = Array.isArray(data) ? data : [data]

    return {
      gitContext: {
        ...currentAttachments.gitContext,
        gitDiffs: removeDuplicates(
          [...(currentAttachments.gitContext?.gitDiffs || []), ...diffs],
          diff =>
            `${diff.from}|${diff.to}|${diff.chunks.map(chunk => chunk.content).join('|')}`
        )
      }
    }
  }
}
