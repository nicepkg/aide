import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import type { GitDiff } from '@extension/webview-api/chat-context-processor/types/chat-context/git-context'
import type { IMentionStrategy } from '@webview/types/chat'

export class GitDiffMentionStrategy implements IMentionStrategy {
  type = 'gitDiff'

  async getData(): Promise<GitDiff[]> {
    // 实现从 VSCode 扩展获取 Git Diff 信息的逻辑
    return []
  }

  updateAttachments(
    data: GitDiff,
    currentAttachments: Attachments
  ): Partial<Attachments> {
    return {
      gitContext: {
        ...currentAttachments.gitContext,
        diffs: [...(currentAttachments.gitContext?.diffs || []), data]
      }
    }
  }
}
