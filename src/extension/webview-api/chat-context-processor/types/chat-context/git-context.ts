import type { BaseContextInfo } from './base-context'

export interface GitDiff extends BaseContextInfo {
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

export interface GitCommit extends BaseContextInfo {
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

export interface GitContext {
  gitCommits: GitCommit[]
  gitDiffs: GitDiff[]
}
