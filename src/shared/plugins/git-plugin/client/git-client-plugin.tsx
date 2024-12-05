import { CommitIcon, MaskOffIcon, TransformIcon } from '@radix-ui/react-icons'
import type {
  ClientPlugin,
  ClientPluginContext
} from '@shared/plugins/base/client/client-plugin-context'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'
import { api } from '@webview/services/api-client'
import { type MentionOption } from '@webview/types/chat'

import type { GitCommit, GitPluginState } from '../types'

export class GitClientPlugin implements ClientPlugin<GitPluginState> {
  id = PluginId.Git

  version: string = pkg.version

  private context: ClientPluginContext<GitPluginState> | null = null

  getInitState() {
    return {
      gitCommitsFromEditor: [],
      gitDiffWithMainBranchFromEditor: null,
      gitDiffOfWorkingStateFromEditor: null
    }
  }

  async activate(context: ClientPluginContext<GitPluginState>): Promise<void> {
    this.context = context

    this.context.registerProvider('state', () => this.context!.state)
    this.context.registerProvider('editor', () => ({
      getMentionOptions: this.getMentionOptions.bind(this)
    }))
  }

  deactivate(): void {
    this.context?.resetState()
    this.context = null
  }

  private async getMentionOptions(): Promise<MentionOption[]> {
    if (!this.context) return []

    const queryClient = this?.context?.getQueryClient?.()

    if (!queryClient) return []

    const gitCommits = await queryClient.fetchQuery({
      queryKey: ['realtime', 'git-commits'],
      queryFn: () =>
        api.git.getHistoryCommits({
          maxCount: 50
        })
    })

    const gitCommitsMentionOptions: MentionOption[] = gitCommits.map(
      commit =>
        ({
          id: `${PluginId.Git}#git-commit#${commit.sha}`,
          type: `${PluginId.Git}#git-commit`,
          label: commit.message,
          data: commit,
          onAddOne: data => {
            this.context?.setState(draft => {
              draft.gitCommitsFromEditor.push(data)
            })
          },
          onReplaceAll: dataArr => {
            this.context?.setState(draft => {
              draft.gitCommitsFromEditor = dataArr
            })
          },

          searchKeywords: [commit.sha, commit.message],
          itemLayoutProps: {
            icon: <CommitIcon className="size-4 mr-1 rotate-90" />,
            label: commit.message,
            details: commit.sha
          }
        }) satisfies MentionOption<GitCommit>
    )

    return [
      {
        id: `${PluginId.Git}#git`,
        type: `${PluginId.Git}#git`,
        label: 'Git',
        topLevelSort: 5,
        searchKeywords: ['git'],
        itemLayoutProps: {
          icon: <TransformIcon className="size-4 mr-1" />,
          label: 'Git'
        },
        children: [
          {
            id: `${PluginId.Git}#git-diff`,
            type: `${PluginId.Git}#git-diff`,
            label: 'Diff (Diff of Working State)',
            // TODO: add data
            onAddOne: data => {
              this.context?.setState(draft => {
                draft.gitDiffOfWorkingStateFromEditor = data
              })
            },
            onReplaceAll: dataArr => {
              this.context?.setState(draft => {
                draft.gitDiffOfWorkingStateFromEditor = dataArr.at(-1)
              })
            },
            searchKeywords: ['diff'],
            itemLayoutProps: {
              icon: <MaskOffIcon className="size-4 mr-1" />,
              label: 'Diff (Diff of Working State)'
            }
          },
          {
            id: `${PluginId.Git}#git-pr`,
            type: `${PluginId.Git}#git-pr`,
            label: 'PR (Diff with Main Branch)',
            // TODO: add data
            onAddOne: data => {
              this.context?.setState(draft => {
                draft.gitDiffWithMainBranchFromEditor = data
              })
            },
            onReplaceAll: dataArr => {
              this.context?.setState(draft => {
                draft.gitDiffWithMainBranchFromEditor = dataArr.at(-1)
              })
            },
            searchKeywords: ['pull request', 'pr', 'diff'],
            itemLayoutProps: {
              icon: <MaskOffIcon className="size-4 mr-1" />,
              label: 'PR (Diff with Main Branch)'
            }
          },
          ...gitCommitsMentionOptions
        ]
      }
    ]
  }
}
