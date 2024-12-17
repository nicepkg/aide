import type { Mention } from '@shared/entities'

import { PluginId } from '../base/types'

export enum GitMentionType {
  Git = `${PluginId.Git}#git`,
  GitCommit = `${PluginId.Git}#git-commit`,
  GitDiff = `${PluginId.Git}#git-diff`,
  GitPR = `${PluginId.Git}#git-pr`
}

export type GitCommitMention = Mention<GitMentionType.GitCommit, GitCommit>
export type GitDiffMention = Mention<GitMentionType.GitDiff, GitDiff>
export type GitPRMention = Mention<GitMentionType.GitPR, GitDiff>
export type GitMention = GitCommitMention | GitDiffMention | GitPRMention

export interface GitDiff {
  /**
   * @example '.github/workflows/ci.yml'
   */
  from: string

  /**
   * @example '.github/workflows/ci.yml'
   */
  to: string
  chunks: {
    /**
     * @example '@@ -1,6 +1,6 @@ importers:'
     */
    content: string

    /**
     * @example [
     * 'name: CI',
     * 'on:',
     * '  push:',
     * '+    branches:',
     * '+      - main',
     * '-    branches:',
     * '-      - master',
     * ]
     */
    lines: string[]
  }[]
}

export interface GitCommit {
  /**
   * @example '0bc7f06aa2930c2755c751615cfb2331de41ddb1'
   */
  sha: string

  /**
   * @example 'ci: fix ci'
   */
  message: string

  diff: GitDiff[]
  author: string
  date: string
}

export interface GitPluginState {}
