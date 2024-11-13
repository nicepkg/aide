import type { Conversation } from '@shared/entities'
import type { ChatStrategyProvider } from '@shared/plugins/base/server/create-provider-manager'
import { PluginId } from '@shared/plugins/base/types'
import { removeDuplicates } from '@shared/utils/common'

import type { GitDiff, GitPluginState } from '../../types'

export class GitChatStrategyProvider implements ChatStrategyProvider {
  async buildContextMessagePrompt(conversation: Conversation): Promise<string> {
    const state = conversation.pluginStates?.[PluginId.Git] as
      | Partial<GitPluginState>
      | undefined

    if (!state) return ''

    const diffWithMainBranchPrompt =
      this.buildGitDiffWithMainBranchPrompt(state)
    const diffOfWorkingStatePrompt =
      this.buildGitDiffOfWorkingStatePrompt(state)
    const commitPrompt = this.buildGitCommitPrompt(state)

    const prompts = [
      diffWithMainBranchPrompt,
      diffOfWorkingStatePrompt,
      commitPrompt
    ].filter(Boolean)

    return prompts.join('\n\n')
  }

  private buildGitCommitPrompt(state: Partial<GitPluginState>): string {
    const { gitCommitsFromEditor = [] } = state

    if (!gitCommitsFromEditor.length) return ''

    let gitCommitContent = `
## Git Commits
  `

    removeDuplicates(gitCommitsFromEditor, ['sha']).forEach(commit => {
      gitCommitContent += `
Commit: ${commit.sha}
Message: ${commit.message}
Author: ${commit.author}
Date: ${commit.date}
Diffs:
${this.buildGitDiffsPrompt(commit.diff)}
`
    })

    return gitCommitContent
  }

  private buildGitDiffWithMainBranchPrompt(
    state: Partial<GitPluginState>
  ): string {
    const { gitDiffWithMainBranchFromEditor } = state

    if (!gitDiffWithMainBranchFromEditor) return ''

    return `
## Git Diff with Main Branch
${this.buildGitDiffsPrompt([gitDiffWithMainBranchFromEditor])}
`
  }

  private buildGitDiffOfWorkingStatePrompt(
    state: Partial<GitPluginState>
  ): string {
    const { gitDiffOfWorkingStateFromEditor } = state

    if (!gitDiffOfWorkingStateFromEditor) return ''

    return `
## Git Diff of Working State
${this.buildGitDiffsPrompt([gitDiffOfWorkingStateFromEditor])}
`
  }

  private buildGitDiffsPrompt(gitDiffs: GitDiff[] | undefined): string {
    if (!gitDiffs?.length) return ''

    let gitDiffContent = ''

    gitDiffs.forEach(diff => {
      gitDiffContent += `
File: ${diff.from} → ${diff.to}
Changes:
${diff.chunks
  .map(chunk => chunk.content + chunk.lines.map(line => line).join('\n'))
  .join('\n')}
`
    })

    return gitDiffContent
  }
}
