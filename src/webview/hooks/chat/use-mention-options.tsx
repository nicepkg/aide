import { useMemo } from 'react'
import {
  CardStackIcon,
  ChevronRightIcon,
  CodeIcon,
  CommitIcon,
  CubeIcon,
  FileIcon,
  GlobeIcon,
  IdCardIcon,
  MaskOffIcon,
  TransformIcon
} from '@radix-ui/react-icons'
import { MentionFilePreview } from '@webview/components/chat/selectors/mention-selector/files/mention-file-preview'
import { MentionFolderPreview } from '@webview/components/chat/selectors/mention-selector/folders/mention-folder-preview'
import { FileIcon as FileIcon2 } from '@webview/components/file-icon'
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
import { getFileNameFromPath } from '@webview/utils/path'

import { useFiles } from '../api/use-files'
import { useFolders } from '../api/use-folders'
import { useGitCommits } from '../api/use-git-commits'

export const useMentionOptions = () => {
  const { data: files = [] } = useFiles()
  const { data: folders = [] } = useFolders()
  const { data: gitCommits = [] } = useGitCommits()

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
            itemLayoutProps: {
              icon: (
                <FileIcon2
                  className="size-4 mr-1"
                  filePath={file.relativePath}
                />
              ),
              label: getFileNameFromPath(file.fullPath),
              details: file.relativePath
            },
            customRenderPreview: MentionFilePreview
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
            itemLayoutProps: {
              icon: (
                <>
                  <ChevronRightIcon className="size-4 mr-1" />
                  <FileIcon2
                    className="size-4 mr-1"
                    isFolder
                    isOpen={false}
                    filePath={folder.relativePath}
                  />
                </>
              ),
              label: getFileNameFromPath(folder.fullPath),
              details: folder.relativePath
            },
            customRenderPreview: MentionFolderPreview
          }) satisfies MentionOption
      ),
    [files]
  )

  const gitCommitsMentionOptions = useMemo<MentionOption[]>(
    () =>
      gitCommits.map(
        commit =>
          ({
            id: `git-commit#${commit.sha}`,
            label: commit.message,
            category: MentionCategory.Git,
            mentionStrategy: new GitCommitsMentionStrategy(),
            searchKeywords: [commit.sha, commit.message],
            data: commit,
            itemLayoutProps: {
              icon: <CommitIcon className="size-4 mr-1 rotate-90" />,
              label: commit.message,
              details: commit.sha
            }
          }) satisfies MentionOption
      ),
    [gitCommits]
  )

  const mentionOptions = useMemo<MentionOption[]>(
    () =>
      [
        {
          id: 'files',
          label: 'Files',
          category: MentionCategory.Files,
          searchKeywords: ['files'],
          children: filesMentionOptions,
          itemLayoutProps: {
            icon: <FileIcon className="size-4 mr-1" />,
            label: 'Files'
          }
        },
        {
          id: 'folders',
          label: 'Folders',
          category: MentionCategory.Folders,
          searchKeywords: ['folders'],
          children: foldersMentionOptions,
          itemLayoutProps: {
            icon: <CardStackIcon className="size-4 mr-1" />,
            label: 'Folders'
          }
        },
        {
          id: 'code',
          label: 'Code',
          category: MentionCategory.Code,
          searchKeywords: ['code'],
          itemLayoutProps: {
            icon: <CodeIcon className="size-4 mr-1" />,
            label: 'Code'
          }
          // mentionStrategy: new CodeChunksMentionStrategy()
        },
        {
          id: 'web',
          label: 'Web',
          category: MentionCategory.Web,
          searchKeywords: ['web'],
          mentionStrategy: new EnableWebToolMentionStrategy(),
          itemLayoutProps: {
            icon: <GlobeIcon className="size-4 mr-1" />,
            label: 'Web'
          }
        },
        {
          id: 'docs',
          label: 'Docs',
          category: MentionCategory.Docs,
          searchKeywords: ['docs'],
          itemLayoutProps: {
            icon: <IdCardIcon className="size-4 mr-1" />,
            label: 'Docs'
          }
          // mentionStrategy: new AllowSearchDocSiteUrlsToolMentionStrategy()
        },
        {
          id: 'git',
          label: 'Git',
          category: MentionCategory.Git,
          searchKeywords: ['git'],
          itemLayoutProps: {
            icon: <TransformIcon className="size-4 mr-1" />,
            label: 'Git'
          },
          children: [
            {
              id: 'git#diff',
              label: 'Diff (Diff of Working State)',
              category: MentionCategory.Git,
              searchKeywords: ['diff'],
              mentionStrategy: new GitDiffsMentionStrategy(),
              itemLayoutProps: {
                icon: <MaskOffIcon className="size-4 mr-1" />,
                label: 'Diff (Diff of Working State)'
              }
            },
            {
              id: 'git#pull-request',
              label: 'PR (Diff with Main Branch)',
              category: MentionCategory.Git,
              searchKeywords: ['pull request', 'pr', 'diff'],
              mentionStrategy: new GitPullRequestsMentionStrategy(),
              itemLayoutProps: {
                icon: <MaskOffIcon className="size-4 mr-1" />,
                label: 'PR (Diff with Main Branch)'
              }
            },
            ...gitCommitsMentionOptions
          ]
        },
        {
          id: 'codebase',
          label: 'Codebase',
          category: MentionCategory.Codebase,
          searchKeywords: ['codebase'],
          mentionStrategy: new RelevantCodeSnippetsMentionStrategy(),
          itemLayoutProps: {
            icon: <CubeIcon className="size-4 mr-1" />,
            label: 'Codebase'
          }
        }
      ] satisfies MentionOption[],
    [filesMentionOptions, foldersMentionOptions, gitCommitsMentionOptions]
  )

  return mentionOptions
}
