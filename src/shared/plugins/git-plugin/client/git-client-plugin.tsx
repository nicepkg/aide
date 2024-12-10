import { CommitIcon, MaskOffIcon, TransformIcon } from '@radix-ui/react-icons'
import type { UseMentionOptionsReturns } from '@shared/plugins/base/client/client-plugin-types'
import {
  createClientPlugin,
  type SetupProps
} from '@shared/plugins/base/client/use-client-plugin'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'
import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'
import { type MentionOption } from '@webview/types/chat'

import type { GitCommit, GitPluginState } from '../types'

export const GitClientPlugin = createClientPlugin<GitPluginState>({
  id: PluginId.Git,
  version: pkg.version,

  getInitialState() {
    return {
      gitCommitsFromEditor: [],
      gitDiffWithMainBranchFromEditor: null,
      gitDiffOfWorkingStateFromEditor: null
    }
  },

  setup(props) {
    const { registerProvider } = props

    registerProvider('useMentionOptions', () => createUseMentionOptions(props))
  }
})

const createUseMentionOptions =
  (props: SetupProps<GitPluginState>) => (): UseMentionOptionsReturns => {
    const { setState } = props
    const { data: gitCommits = [] } = useQuery({
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
          onUpdatePluginState: dataArr => {
            setState(draft => {
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
            onUpdatePluginState: dataArr => {
              setState(draft => {
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
            onUpdatePluginState: dataArr => {
              setState(draft => {
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
