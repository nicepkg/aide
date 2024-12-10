import type { FileInfo, FolderInfo } from '@extension/file-utils/traverse-fs'
import {
  CardStackIcon,
  CubeIcon,
  ExclamationTriangleIcon
} from '@radix-ui/react-icons'
import type {
  UseMentionOptionsReturns,
  UseSelectedFilesReturns,
  UseSelectedImagesReturns
} from '@shared/plugins/base/client/client-plugin-types'
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

import type { FsPluginState, TreeInfo } from '../types'
import { FsLogPreview } from './fs-log-preview'
import { MentionFilePreview } from './mention-file-preview'
import { MentionFolderPreview } from './mention-folder-preview'
import { MentionTreePreview } from './mention-tree-preview'

export const FsClientPlugin = createClientPlugin<FsPluginState>({
  id: PluginId.Fs,
  version: pkg.version,

  getInitialState() {
    return {
      selectedFilesFromFileSelector: [],
      selectedFilesFromEditor: [],
      selectedFilesFromAgent: [],
      currentFilesFromVSCode: [],
      selectedFoldersFromEditor: [],
      selectedImagesFromOutsideUrl: [],
      codeChunksFromEditor: [],
      codeSnippetFromAgent: [],
      enableCodebaseAgent: false,
      editorErrors: [],
      selectedTreesFromEditor: []
    }
  },

  setup(props) {
    const { registerProvider } = props

    registerProvider('useMentionOptions', () => createUseMentionOptions(props))
    registerProvider('useSelectedFiles', () => createUseSelectedFiles(props))
    registerProvider('useSelectedImages', () => createUseSelectedImages(props))
    registerProvider('CustomRenderLogPreview', () => FsLogPreview)
  }
})

const createUseSelectedFiles =
  (props: SetupProps<FsPluginState>) => (): UseSelectedFilesReturns => ({
    selectedFiles: props.state.selectedFilesFromFileSelector || [],
    setSelectedFiles: files =>
      props.setState(draft => {
        draft.selectedFilesFromFileSelector = files
      })
  })

const createUseSelectedImages =
  (props: SetupProps<FsPluginState>) => (): UseSelectedImagesReturns => ({
    selectedImages: props.state.selectedImagesFromOutsideUrl || [],
    addSelectedImage: image => {
      props.setState(draft => {
        draft.selectedImagesFromOutsideUrl.push(image)
      })
    },
    removeSelectedImage: image => {
      props.setState(draft => {
        draft.selectedImagesFromOutsideUrl =
          draft.selectedImagesFromOutsideUrl.filter(i => i.url !== image.url)
      })
    }
  })

const createUseMentionOptions =
  (props: SetupProps<FsPluginState>) => (): UseMentionOptionsReturns => {
    const { setState } = props
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
        id: `${PluginId.Fs}#file#${file.fullPath}`,
        type: `${PluginId.Fs}#file`,
        label,
        data: file,
        onUpdatePluginState: dataArr => {
          setState(draft => {
            draft.selectedFilesFromEditor = dataArr
          })
        },

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
        id: `${PluginId.Fs}#folder#${folder.fullPath}`,
        type: `${PluginId.Fs}#folder`,
        label,
        data: folder,
        onUpdatePluginState: dataArr => {
          setState(draft => {
            draft.selectedFoldersFromEditor = dataArr
          })
        },

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
        id: `${PluginId.Fs}#tree#${treeInfo.fullPath}`,
        type: `${PluginId.Fs}#tree`,
        label,
        data: treeInfo,
        onUpdatePluginState: dataArr => {
          setState(draft => {
            draft.selectedTreesFromEditor = dataArr
          })
        },
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
        id: `${PluginId.Fs}#files`,
        type: `${PluginId.Fs}#files`,
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
        id: `${PluginId.Fs}#folders`,
        type: `${PluginId.Fs}#folders`,
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
        id: `${PluginId.Fs}#tree`,
        type: `${PluginId.Fs}#tree`,
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
      //   id: `${PluginId.Fs}#code`,
      //   type: `${PluginId.Fs}#code`,
      //   label: 'Code',
      //   topLevelSort: 2,
      //   searchKeywords: ['code'],
      //   itemLayoutProps: {
      //     icon: <CodeIcon className="size-4 mr-1" />,
      //     label: 'Code'
      //   }
      // },
      {
        id: `${PluginId.Fs}#codebase`,
        type: `${PluginId.Fs}#codebase`,
        label: 'Codebase',
        data: true,
        onUpdatePluginState: (dataArr: true[]) => {
          setState(draft => {
            draft.enableCodebaseAgent = dataArr.length > 0
            draft.codeSnippetFromAgent = []
          })
        },
        topLevelSort: 6,
        searchKeywords: ['codebase'],
        itemLayoutProps: {
          icon: <CubeIcon className="size-4 mr-1" />,
          label: 'Codebase'
        }
      },
      {
        id: `${PluginId.Fs}#errors`,
        type: `${PluginId.Fs}#errors`,
        label: 'Errors',
        data: editorErrors,
        onUpdatePluginState: dataArr => {
          setState(draft => {
            draft.editorErrors = dataArr?.[0] ?? []
          })
        },
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
