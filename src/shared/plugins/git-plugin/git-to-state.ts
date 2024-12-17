import { BaseToState } from '../base/base-to-state'
import { GitMentionType, type GitMention } from './types'

export class GitToState extends BaseToState<GitMention> {
  toMentionsState() {
    return {
      gitCommits: this.getMentionDataByType(GitMentionType.GitCommit),

      gitDiffOfWorkingState: this.getMentionDataByType(
        GitMentionType.GitDiff
      )?.[0],

      gitDiffWithMain: this.getMentionDataByType(GitMentionType.GitDiff)?.[0]
    }
  }

  toAgentsState() {
    return {}
  }
}
