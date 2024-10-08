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
import {
  AttachmentType,
  ContextInfoSource,
  SearchSortStrategy,
  type DocSiteName,
  type FileInfo,
  type FolderInfo,
  type GitCommit,
  type MentionOption
} from '@webview/types/chat'
import { getFileNameFromPath } from '@webview/utils/path'

import { useDocSites } from '../api/use-doc-sites'
import { useFiles } from '../api/use-files'
import { useFolders } from '../api/use-folders'
import { useGitCommits } from '../api/use-git-commits'

export const useMentionOptions = () => {
  const { data: files = [] } = useFiles()
  const { data: folders = [] } = useFolders()
  const { data: gitCommits = [] } = useGitCommits()
  const { data: docSites = [] } = useDocSites()

  const filesMentionOptions: MentionOption[] = files.map(
    file =>
      ({
        id: `file#${file.fullPath}`,
        label: getFileNameFromPath(file.fullPath),
        type: AttachmentType.Files,
        searchKeywords: [file.relativePath],
        searchSortStrategy: SearchSortStrategy.EndMatch,
        data: { ...file, source: ContextInfoSource.Editor } satisfies FileInfo,
        itemLayoutProps: {
          icon: (
            <FileIcon2 className="size-4 mr-1" filePath={file.relativePath} />
          ),
          label: getFileNameFromPath(file.fullPath),
          details: file.relativePath
        },
        customRenderPreview: MentionFilePreview
      }) satisfies MentionOption,
    [files]
  )

  const foldersMentionOptions: MentionOption[] = folders.map(
    folder =>
      ({
        id: `folder#${folder.fullPath}`,
        label: getFileNameFromPath(folder.fullPath),
        type: AttachmentType.Folders,
        searchKeywords: [folder.relativePath],
        searchSortStrategy: SearchSortStrategy.EndMatch,
        data: {
          ...folder,
          source: ContextInfoSource.Editor
        } satisfies FolderInfo,
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
  )

  const gitCommitsMentionOptions: MentionOption[] = gitCommits.map(
    commit =>
      ({
        id: `git-commit#${commit.sha}`,
        label: commit.message,
        type: AttachmentType.GitCommit,
        searchKeywords: [commit.sha, commit.message],
        data: {
          ...commit,
          source: ContextInfoSource.Editor
        } satisfies GitCommit,
        itemLayoutProps: {
          icon: <CommitIcon className="size-4 mr-1 rotate-90" />,
          label: commit.message,
          details: commit.sha
        }
      }) satisfies MentionOption
  )

  const docSiteNamesMentionOptions: MentionOption[] = docSites.map(site => ({
    id: `doc-site#${site.id}`,
    label: site.name,
    type: AttachmentType.Docs,
    searchKeywords: [site.name, site.url],
    data: {
      name: site.name,
      source: ContextInfoSource.Editor
    } satisfies DocSiteName,
    itemLayoutProps: {
      icon: <IdCardIcon className="size-4 mr-1" />,
      label: site.name,
      details: site.url
    }
  }))

  const mentionOptions: MentionOption[] = [
    {
      id: 'files',
      label: 'Files',
      type: AttachmentType.Files,
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
      type: AttachmentType.Folders,
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
      type: AttachmentType.Code,
      searchKeywords: ['code'],
      itemLayoutProps: {
        icon: <CodeIcon className="size-4 mr-1" />,
        label: 'Code'
      }
    },
    {
      id: 'web',
      label: 'Web',
      type: AttachmentType.Web,
      searchKeywords: ['web'],
      itemLayoutProps: {
        icon: <GlobeIcon className="size-4 mr-1" />,
        label: 'Web'
      }
    },
    {
      id: 'docs',
      label: 'Docs',
      type: AttachmentType.Docs,
      searchKeywords: ['docs'],
      itemLayoutProps: {
        icon: <IdCardIcon className="size-4 mr-1" />,
        label: 'Docs'
      },
      children: docSiteNamesMentionOptions
    },
    {
      id: 'git',
      label: 'Git',
      searchKeywords: ['git'],
      itemLayoutProps: {
        icon: <TransformIcon className="size-4 mr-1" />,
        label: 'Git'
      },
      children: [
        {
          id: 'git#diff',
          label: 'Diff (Diff of Working State)',
          type: AttachmentType.GitDiff,
          searchKeywords: ['diff'],
          itemLayoutProps: {
            icon: <MaskOffIcon className="size-4 mr-1" />,
            label: 'Diff (Diff of Working State)'
          }
        },
        {
          id: 'git#pull-request',
          label: 'PR (Diff with Main Branch)',
          type: AttachmentType.GitPr,
          searchKeywords: ['pull request', 'pr', 'diff'],
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
      type: AttachmentType.Codebase,
      searchKeywords: ['codebase'],
      itemLayoutProps: {
        icon: <CubeIcon className="size-4 mr-1" />,
        label: 'Codebase'
      }
    }
  ]

  return mentionOptions
}
