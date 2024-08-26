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

export interface GitPullRequest {
  id: number
  title: string
  description: string
  author: string
  url: string
  diff: GitDiff[]
}

export interface GitContext {
  commits: GitCommit[]
  pullRequests: GitPullRequest[]
  diffs: GitDiff[]
}
