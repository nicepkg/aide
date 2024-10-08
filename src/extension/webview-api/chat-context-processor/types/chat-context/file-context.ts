import type {
  FileInfo as IFileInfo,
  FolderInfo as IFolderInfo
} from '@extension/file-utils/traverse-fs'

import type { BaseContextInfo } from './base-context'

export interface FileInfo extends BaseContextInfo, IFileInfo {}
export interface FolderInfo extends BaseContextInfo, IFolderInfo {}
export interface ImageInfo extends BaseContextInfo {
  url: string
}

export interface FileContext {
  selectedFiles: FileInfo[]
  selectedFolders: FolderInfo[]
  selectedImages: ImageInfo[]
  currentFiles: FileInfo[] // only for record the current files when create conversation, not ensure for chat context
}
