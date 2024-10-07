import type { CommandManager } from '@extension/commands/command-manager'
import type { RegisterManager } from '@extension/registers/register-manager'
import { getWorkspaceFolder } from '@extension/utils'
import { settledPromiseResults } from '@shared/utils/common'
import simpleGit, { SimpleGit } from 'simple-git'

import type {
  GitCommit,
  GitDiff
} from '../chat-context-processor/types/chat-context'
import { Controller } from '../types'

export class GitController extends Controller {
  readonly name = 'git'

  private git: SimpleGit

  constructor(
    registerManager: RegisterManager,
    commandManager: CommandManager
  ) {
    super(registerManager, commandManager)
    const workspaceFolder = getWorkspaceFolder()
    this.git = simpleGit(workspaceFolder.uri.fsPath)
  }

  async getHistoryCommits(req: { maxCount?: number }): Promise<GitCommit[]> {
    const { maxCount = 50 } = req
    const log = await this.git.log({ maxCount })

    const commits: GitCommit[] = await settledPromiseResults(
      log.all.map(async commit => {
        const diff = await this.git.diff([`${commit.hash}^`, commit.hash])
        return {
          sha: commit.hash,
          message: commit.message,
          diff: this.parseDiff(diff),
          author: commit.author_name,
          date: commit.date
        }
      })
    )

    return commits
  }

  async getDiffWithRemoteMainBranch(req: {
    file?: string
  }): Promise<GitDiff[]> {
    const mainBranchName = await this.getMainBranchName()
    const { file } = req
    let diff: string

    if (file) {
      diff = await this.git.diff([`origin/${mainBranchName}`, '--', file])
    } else {
      diff = await this.git.diff([`origin/${mainBranchName}`])
    }

    return this.parseDiff(diff)
  }

  async getDiffWithWorkingState(req: { file?: string }): Promise<GitDiff[]> {
    const { file } = req
    let diff: string

    if (file) {
      diff = await this.git.diff(['HEAD', '--', file])
    } else {
      diff = await this.git.diff(['HEAD'])
    }

    return this.parseDiff(diff)
  }

  private parseDiff(diff: string): GitDiff[] {
    const files = diff.split('diff --git')

    const diffs: GitDiff[] = []

    files.slice(1).forEach(file => {
      const [header, ...chunks] = file.split('@@')
      if (!header) return

      const [from, to] = header.match(/a\/(.+) b\/(.+)/)?.slice(1) || ['', '']

      if (!from || !to) return

      diffs.push({
        from,
        to,
        chunks: chunks.map(chunk => {
          const [content, ...lines] = chunk.split('\n')
          return {
            content: `@@ ${content}`,
            lines: lines.filter(line => line.trim() !== '')
          }
        })
      })
    })

    return diffs
  }

  async getCurrentBranch(): Promise<string> {
    return await this.git.revparse(['--abbrev-ref', 'HEAD'])
  }

  async getStatus(): Promise<any> {
    return await this.git.status()
  }

  async getRemotes(): Promise<any[]> {
    const remotes = await this.git.getRemotes(true)
    return remotes
  }

  private async getMainBranchName(): Promise<string> {
    const branches = await this.git.branch()
    const mainBranch = ['main', 'master', 'trunk', 'development'].find(branch =>
      branches.all.includes(branch)
    )

    return mainBranch || 'main'
  }
}
