import type { FileInfo, FolderInfo } from '@extension/file-utils/traverse-fs'

export type { FileInfo, FolderInfo }

export interface ImageInfo {
  url: string
}

export interface FileContext {
  selectedFiles: FileInfo[]
  selectedFolders: FolderInfo[]
  selectedImages: ImageInfo[]
  currentFiles: FileInfo[] // only for record the current files when create conversation, not ensure for chat context
}
