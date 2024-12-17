import type { FileInfo, FolderInfo } from '@extension/file-utils/traverse-fs'
import {
  CardStackIcon,
  CubeIcon,
  ExclamationTriangleIcon
} from '@radix-ui/react-icons'
import type { UseMentionOptionsReturns } from '@shared/plugins/base/client/client-plugin-types'
import {
  createClientPlugin,
  type SetupProps
} from '@shared/plugins/base/client/use-client-plugin'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'
import { useQuery } from '@tanstack/react-query'
import { FileIcon as FileIcon2 } from '@webview/components/file-icon'
import { api } from '@webview/services/api-client'
import { SearchSortStrategy, type MentionOption } from '@webview/types/chat'
import { getFileNameFromPath } from '@webview/utils/path'
import { ChevronRightIcon, FileIcon, FolderTreeIcon } from 'lucide-react'

import { FsMentionType, type FsPluginState, type TreeInfo } from '../types'
import { FsLogPreview } from './fs-log-preview'
import { MentionFilePreview } from './mention-file-preview'
import { MentionFolderPreview } from './mention-folder-preview'
import { MentionTreePreview } from './mention-tree-preview'

export const FsClientPlugin = createClientPlugin<FsPluginState>({
  id: PluginId.Fs,
  version: pkg.version,

  getInitialState() {
    return {}
  },

  setup(props) {
    const { registerProvider } = props

    registerProvider('useMentionOptions', () => createUseMentionOptions(props))
    registerProvider('CustomRenderLogPreview', () => FsLogPreview)
  }
})

const createUseMentionOptions =
  (props: SetupProps<FsPluginState>) => (): UseMentionOptionsReturns => {
    const { data: files = [] } = useQuery({
      queryKey: ['realtime', 'files'],
      queryFn: () => api.file.traverseWorkspaceFiles({ filesOrFolders: ['./'] })
    })

    const { data: folders = [] } = useQuery({
      queryKey: ['realtime', 'folders'],
      queryFn: () => api.file.traverseWorkspaceFolders({ folders: ['./'] })
    })

    const { data: editorErrors = [] } = useQuery({
      queryKey: ['realtime', 'editorErrors'],
      queryFn: () => api.file.getCurrentEditorErrors({})
    })

    const { data: treesInfo = [] } = useQuery({
      queryKey: ['realtime', 'treesInfo'],
      queryFn: () => api.file.getWorkspaceTreesInfo({ depth: 5 })
    })

    const filesMentionOptions: MentionOption[] = files.map(file => {
      const label = getFileNameFromPath(file.fullPath)

      return {
        id: `${FsMentionType.File}#${file.fullPath}`,
        type: FsMentionType.File,
        label,
        data: file,
        searchKeywords: [file.relativePath, label],
        searchSortStrategy: SearchSortStrategy.EndMatch,
        itemLayoutProps: {
          icon: (
            <FileIcon2 className="size-4 mr-1" filePath={file.relativePath} />
          ),
          label,
          details: file.relativePath
        },
        customRenderPreview: MentionFilePreview
      } satisfies MentionOption<FileInfo>
    })

    const foldersMentionOptions: MentionOption[] = folders.map(folder => {
      const label = getFileNameFromPath(folder.fullPath)

      return {
        id: `${FsMentionType.Folder}#${folder.fullPath}`,
        type: FsMentionType.Folder,
        label,
        data: folder,
        searchKeywords: [folder.relativePath, label],
        searchSortStrategy: SearchSortStrategy.EndMatch,
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
          label,
          details: folder.relativePath
        },
        customRenderPreview: MentionFolderPreview
      } satisfies MentionOption<FolderInfo>
    })

    const treesMentionOptions: MentionOption[] = treesInfo.map(treeInfo => {
      const label = getFileNameFromPath(treeInfo.fullPath)

      return {
        id: `${FsMentionType.Tree}#${treeInfo.fullPath}`,
        type: FsMentionType.Tree,
        label,
        data: treeInfo,
        searchKeywords: [treeInfo.relativePath, label],
        searchSortStrategy: SearchSortStrategy.EndMatch,
        itemLayoutProps: {
          icon: <FolderTreeIcon className="size-4 mr-1" />,
          label,
          details: treeInfo.relativePath
        },
        customRenderPreview: MentionTreePreview
      } satisfies MentionOption<TreeInfo>
    })

    return [
      {
        id: FsMentionType.Files,
        type: FsMentionType.Files,
        label: 'Files',
        topLevelSort: 0,
        searchKeywords: ['files'],
        children: filesMentionOptions,
        itemLayoutProps: {
          icon: <FileIcon className="size-4 mr-1" />,
          label: 'Files'
        }
      },
      {
        id: FsMentionType.Folders,
        type: FsMentionType.Folders,
        label: 'Folders',
        topLevelSort: 1,
        searchKeywords: ['folders'],
        children: foldersMentionOptions,
        itemLayoutProps: {
          icon: <CardStackIcon className="size-4 mr-1" />,
          label: 'Folders'
        }
      },
      {
        id: FsMentionType.Trees,
        type: FsMentionType.Trees,
        label: 'Tree',
        topLevelSort: 2,
        searchKeywords: ['tree', 'structure'],
        children: treesMentionOptions,
        itemLayoutProps: {
          icon: <FolderTreeIcon className="size-4 mr-1" />,
          label: 'Tree'
        }
      },
      // {
      //   id: FsMentionType.Code,
      //   type: FsMentionType.Code,
      //   label: 'Code',
      //   topLevelSort: 2,
      //   searchKeywords: ['code'],
      //   itemLayoutProps: {
      //     icon: <CodeIcon className="size-4 mr-1" />,
      //     label: 'Code'
      //   }
      // },
      {
        id: FsMentionType.Codebase,
        type: FsMentionType.Codebase,
        label: 'Codebase',
        data: true,
        topLevelSort: 6,
        searchKeywords: ['codebase'],
        itemLayoutProps: {
          icon: <CubeIcon className="size-4 mr-1" />,
          label: 'Codebase'
        }
      },
      {
        id: FsMentionType.Errors,
        type: FsMentionType.Errors,
        label: 'Errors',
        data: editorErrors,
        topLevelSort: 7,
        searchKeywords: ['errors', 'warnings', 'diagnostics'],
        itemLayoutProps: {
          icon: <ExclamationTriangleIcon className="size-4 mr-1" />,
          label: (
            <>
              Errors
              <span className="ml-2 overflow-hidden text-ellipsis text-xs text-foreground/50 whitespace-nowrap">
                ({editorErrors.length})
              </span>
            </>
          )
        }
      }
    ]
  }
