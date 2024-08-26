import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import type { GitCommit } from '@extension/webview-api/chat-context-processor/types/chat-context/git-context'
import type { IMentionStrategy } from '@webview/types/chat'

export class GitCommitMentionStrategy implements IMentionStrategy {
  type = 'gitCommit'

  async getData(): Promise<GitCommit[]> {
    // 实现从 VSCode 扩展获取 Git 提交信息的逻辑
    return []
  }

  updateAttachments(
    data: GitCommit,
    currentAttachments: Attachments
  ): Partial<Attachments> {
    return {
      gitContext: {
        ...currentAttachments.gitContext,
        commits: [...(currentAttachments.gitContext?.commits || []), data]
      }
    }
  }
}
