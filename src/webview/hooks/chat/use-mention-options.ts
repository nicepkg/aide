import { useMemo } from 'react'
import { MentionFileItem } from '@webview/components/chat/selectors/mention-selector/files/mention-file-item'
import { MentionFolderItem } from '@webview/components/chat/selectors/mention-selector/folders/mention-folder-item'
import { RelevantCodeSnippetsMentionStrategy } from '@webview/lexical/mentions/codebase/relevant-code-snippets-mention-strategy'
import { SelectedFilesMentionStrategy } from '@webview/lexical/mentions/files/selected-files-mention-strategy'
import { SelectedFoldersMentionStrategy } from '@webview/lexical/mentions/folders/selected-folders-mention-strategy'
import { GitCommitsMentionStrategy } from '@webview/lexical/mentions/git/git-commits-mention-strategy'
import { GitDiffsMentionStrategy } from '@webview/lexical/mentions/git/git-diffs-mention-strategy'
import { GitPullRequestsMentionStrategy } from '@webview/lexical/mentions/git/git-pull-requests-mention-strategy'
import { EnableWebToolMentionStrategy } from '@webview/lexical/mentions/web/enable-web-tool-mention-strategy'
import {
  MentionCategory,
  SearchSortStrategy,
  type MentionOption
} from '@webview/types/chat'
import { getFileNameFromPath } from '@webview/utils/common'

import { useFiles } from '../api/use-files'
import { useFolders } from '../api/use-folders'

export const useMentionOptions = () => {
  const { data: files = [] } = useFiles()
  const { data: folders = [] } = useFolders()

  const filesMentionOptions = useMemo<MentionOption[]>(
    () =>
      files.map(
        file =>
          ({
            id: `file#${file.fullPath}`,
            label: getFileNameFromPath(file.fullPath),
            category: MentionCategory.Files,
            mentionStrategy: new SelectedFilesMentionStrategy(),
            searchKeywords: [file.relativePath],
            searchSortStrategy: SearchSortStrategy.EndMatch,
            data: file,
            customRender: MentionFileItem
          }) satisfies MentionOption,
        [files]
      ),
    [files]
  )

  const foldersMentionOptions = useMemo<MentionOption[]>(
    () =>
      folders.map(
        folder =>
          ({
            id: `folder#${folder.fullPath}`,
            label: getFileNameFromPath(folder.fullPath),
            category: MentionCategory.Folders,
            mentionStrategy: new SelectedFoldersMentionStrategy(),
            searchKeywords: [folder.relativePath],
            searchSortStrategy: SearchSortStrategy.EndMatch,
            data: folder,
            customRender: MentionFolderItem
          }) satisfies MentionOption
      ),
    [files]
  )

  const mentionOptions = useMemo<MentionOption[]>(
    () => [
      {
        id: 'files',
        label: 'Files',
        category: MentionCategory.Files,
        searchKeywords: ['files'],
        children: filesMentionOptions
      },
      {
        id: 'folders',
        label: 'Folders',
        category: MentionCategory.Folders,
        searchKeywords: ['folders'],
        children: foldersMentionOptions
      },
      {
        id: 'code',
        label: 'Code',
        category: MentionCategory.Code,
        searchKeywords: ['code']
        // mentionStrategies: [new CodeChunksMentionStrategy()]
      },
      {
        id: 'web',
        label: 'Web',
        category: MentionCategory.Web,
        searchKeywords: ['web'],
        mentionStrategy: new EnableWebToolMentionStrategy()
      },
      {
        id: 'docs',
        label: 'Docs',
        category: MentionCategory.Docs,
        searchKeywords: ['docs']
        // mentionStrategies: [new AllowSearchDocSiteUrlsToolMentionStrategy()]
      },
      {
        id: 'git',
        label: 'Git',
        category: MentionCategory.Git,
        searchKeywords: ['git'],
        children: [
          {
            id: 'git#commit',
            label: 'Commit',
            category: MentionCategory.Git,
            searchKeywords: ['commit'],
            mentionStrategy: new GitCommitsMentionStrategy()
          },
          {
            id: 'git#diff',
            label: 'Diff',
            category: MentionCategory.Git,
            searchKeywords: ['diff'],
            mentionStrategy: new GitDiffsMentionStrategy()
          },
          {
            id: 'git#pull-requests',
            label: 'Pull Requests',
            category: MentionCategory.Git,
            searchKeywords: ['pull requests'],
            mentionStrategy: new GitPullRequestsMentionStrategy()
          }
        ]
      },
      {
        id: 'codebase',
        label: 'Codebase',
        category: MentionCategory.Codebase,
        searchKeywords: ['codebase'],
        mentionStrategy: new RelevantCodeSnippetsMentionStrategy()
      }
    ],
    [filesMentionOptions, foldersMentionOptions]
  )

  return mentionOptions
}
