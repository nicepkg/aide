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

import { GitCommit, GitMentionType, GitPluginState } from '../types'

export const GitClientPlugin = createClientPlugin<GitPluginState>({
  id: PluginId.Git,
  version: pkg.version,

  getInitialState() {
    return {}
  },

  setup(props) {
    const { registerProvider } = props

    registerProvider('useMentionOptions', () => createUseMentionOptions(props))
  }
})

const createUseMentionOptions =
  (props: SetupProps<GitPluginState>) => (): UseMentionOptionsReturns => {
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
          id: `${GitMentionType.GitCommit}#${commit.sha}`,
          type: GitMentionType.GitCommit,
          label: commit.message,
          data: commit,
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
        id: GitMentionType.Git,
        type: GitMentionType.Git,
        label: 'Git',
        topLevelSort: 5,
        searchKeywords: ['git'],
        itemLayoutProps: {
          icon: <TransformIcon className="size-4 mr-1" />,
          label: 'Git'
        },
        children: [
          {
            id: GitMentionType.GitDiff,
            type: GitMentionType.GitDiff,
            label: 'Diff (Diff of Working State)',
            data: null, // TODO: add diff of working state
            searchKeywords: ['diff'],
            itemLayoutProps: {
              icon: <MaskOffIcon className="size-4 mr-1" />,
              label: 'Diff (Diff of Working State)'
            }
          },
          {
            id: GitMentionType.GitPR,
            type: GitMentionType.GitPR,
            label: 'PR (Diff with Main Branch)',
            data: null, // TODO: add diff with main branch
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
