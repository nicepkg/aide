import {
  GitCommit,
  GitContext,
  GitDiff,
  type GitPullRequest
} from '../types/chat-context/git-context'
import type { ContextProcessor } from '../types/context-processor'
import type { LangchainMessageParams } from '../types/langchain-message'

export class GitProcessor implements ContextProcessor<GitContext> {
  async buildMessageParams(
    attachment: GitContext
  ): Promise<LangchainMessageParams> {
    return this.processGitContext(attachment)
  }

  private processGitContext(gitContext: GitContext): LangchainMessageParams {
    let content = ''

    content += this.processCommits(gitContext.gitCommits)
    content += this.processPullRequests(gitContext.gitPullRequests)
    content += this.processDiffs(gitContext.gitDiffs)

    return content
  }

  private processCommits(commits: GitCommit[]): string {
    if (commits.length === 0) return ''

    let content = 'Relevant commits:\n\n'
    for (const commit of commits) {
      content += `Commit: ${commit.sha}\n`
      content += `Message: ${commit.message}\n`
      content += `Author: ${commit.author}\n`
      content += `Date: ${commit.date}\n`
      content += 'Changes:\n'
      content += this.processDiffs(commit.diff)
      content += '\n'
    }
    return content
  }

  private processPullRequests(prs: GitPullRequest[]): string {
    if (prs.length === 0) return ''

    let content = 'Relevant pull requests:\n\n'
    for (const pr of prs) {
      content += `PR #${pr.id}: ${pr.title}\n`
      content += `Description: ${pr.description}\n`
      content += `Author: ${pr.author}\n`
      content += `URL: ${pr.url}\n`
      content += 'Changes:\n'
      content += this.processDiffs(pr.diff)
      content += '\n'
    }
    return content
  }

  private processDiffs(diffs: GitDiff[]): string {
    let content = ''
    for (const diff of diffs) {
      content += `File: ${diff.from} → ${diff.to}\n`
      for (const chunk of diff.chunks) {
        content += `${chunk.content}\n`
        for (const line of chunk.lines) {
          content += `${line}\n`
        }
      }
      content += '\n'
    }
    return content
  }
}
