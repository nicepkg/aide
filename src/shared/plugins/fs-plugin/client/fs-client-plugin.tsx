import {
  CardStackIcon,
  ChevronRightIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  FileIcon
} from '@radix-ui/react-icons'
import type {
  ClientPlugin,
  ClientPluginContext
} from '@shared/plugins/base/client/client-plugin-context'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'
import { FileIcon as FileIcon2 } from '@webview/components/file-icon'
import { api } from '@webview/services/api-client'
import {
  SearchSortStrategy,
  type FileInfo,
  type FolderInfo,
  type MentionOption
} from '@webview/types/chat'
import { getFileNameFromPath } from '@webview/utils/path'
import { FolderTreeIcon } from 'lucide-react'

import type { FsPluginState, ImageInfo, TreeInfo } from '../types'
import { FsLogPreview } from './fs-log-preview'
import { MentionFilePreview } from './mention-file-preview'
import { MentionFolderPreview } from './mention-folder-preview'
import { MentionTreePreview } from './mention-tree-preview'

export class FsClientPlugin implements ClientPlugin<FsPluginState> {
  id = PluginId.Fs

  version: string = pkg.version

  private context: ClientPluginContext<FsPluginState> | null = null

  getInitState() {
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
  }

  async activate(context: ClientPluginContext<FsPluginState>): Promise<void> {
    this.context = context

    this.context.registerProvider('state', () => this.context!.state)
    this.context.registerProvider('editor', () => ({
      getMentionOptions: this.getMentionOptions.bind(this)
    }))
    this.context.registerProvider('filesSelector', () => ({
      getSelectedFiles: this.getSelectedFiles.bind(this),
      setSelectedFiles: this.setSelectedFiles.bind(this)
    }))
    this.context.registerProvider('imagesSelector', () => ({
      getSelectedImages: this.getSelectedImages.bind(this),
      addSelectedImage: this.addSelectedImage.bind(this),
      removeSelectedImage: this.removeSelectedImage.bind(this)
    }))
    this.context.registerProvider('message', () => ({
      customRenderLogPreview: FsLogPreview
    }))
  }

  deactivate(): void {
    this.context?.resetState()
    this.context = null
  }

  private getSelectedFiles(): FileInfo[] {
    if (!this.context) return []

    return this.context.state.selectedFilesFromFileSelector
  }

  private setSelectedFiles(files: FileInfo[]): void {
    if (!this.context) return

    this.context.setState(draft => {
      draft.selectedFilesFromFileSelector = files
    })
  }

  private getSelectedImages(): ImageInfo[] {
    if (!this.context) return []

    return this.context.state.selectedImagesFromOutsideUrl
  }

  private addSelectedImage(image: ImageInfo): void {
    if (!this.context) return

    this.context.setState(draft => {
      draft.selectedImagesFromOutsideUrl.push(image)
    })
  }

  private removeSelectedImage(image: ImageInfo): void {
    if (!this.context) return

    this.context.setState(draft => {
      draft.selectedImagesFromOutsideUrl =
        draft.selectedImagesFromOutsideUrl.filter(i => i.url !== image.url)
    })
  }

  private async getMentionOptions(): Promise<MentionOption[]> {
    if (!this.context) return []

    const queryClient = this?.context?.getQueryClient?.()

    if (!queryClient) return []

    const files = await queryClient.fetchQuery({
      queryKey: ['realtime', 'files'],
      queryFn: () => api.file.traverseWorkspaceFiles({ filesOrFolders: ['./'] })
    })

    const folders = await queryClient.fetchQuery({
      queryKey: ['realtime', 'folders'],
      queryFn: () => api.file.traverseWorkspaceFolders({ folders: ['./'] })
    })

    const editorErrors = await queryClient.fetchQuery({
      queryKey: ['realtime', 'editorErrors'],
      queryFn: () => api.file.getCurrentEditorErrors({})
    })

    const treesInfo = await queryClient.fetchQuery({
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
        onAddOne: data => {
          this.context?.setState(draft => {
            draft.selectedFilesFromEditor.push(data)
          })
        },
        onReplaceAll: dataArr => {
          this.context?.setState(draft => {
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
        onAddOne: data => {
          this.context?.setState(draft => {
            draft.selectedFoldersFromEditor.push(data)
          })
        },
        onReplaceAll: dataArr => {
          this.context?.setState(draft => {
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
        onAddOne: data => {
          this.context?.setState(draft => {
            draft.selectedTreesFromEditor.push(data)
          })
        },
        onReplaceAll: dataArr => {
          this.context?.setState(draft => {
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
        onAddOne: () => {
          this.context?.setState(draft => {
            draft.enableCodebaseAgent = true
            draft.codeSnippetFromAgent = []
          })
        },
        onReplaceAll: (dataArr: true[]) => {
          this.context?.setState(draft => {
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
        onAddOne: data => {
          this.context?.setState(draft => {
            draft.editorErrors = data
          })
        },
        onReplaceAll: dataArr => {
          this.context?.setState(draft => {
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
}
