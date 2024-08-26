import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import type { GitPullRequest } from '@extension/webview-api/chat-context-processor/types/chat-context/git-context'
import type { IMentionStrategy } from '@webview/types/chat'

export class GitPullRequestMentionStrategy implements IMentionStrategy {
  type = 'gitPullRequest'

  async getData(): Promise<GitPullRequest[]> {
    // 实现从 VSCode 扩展获取 Git Pull Request 信息的逻辑
    return []
  }

  updateAttachments(
    data: GitPullRequest,
    currentAttachments: Attachments
  ): Partial<Attachments> {
    return {
      gitContext: {
        ...currentAttachments.gitContext,
        pullRequests: [
          ...(currentAttachments.gitContext?.pullRequests || []),
          data
        ]
      }
    }
  }
}
