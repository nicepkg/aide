import type { FileInfo, FolderInfo } from '@extension/file-utils/traverse-fs'

export type { FileInfo, FolderInfo }
// /**
//  * Represents information about a file.
//  */
// export interface FileInfo {
//   /**
//    * The content of the file.
//    */
//   content: string
//   /**
//    * The relative path of the file.
//    */
//   relativePath: string

//   /**
//    * The full path of the file.
//    */
//   fullPath: string
// }

// export interface FolderInfo {
//   fullPath: string
//   relativePath: string
// }

export interface ImageInfo {
  url: string
}

export interface FileContext {
  selectedFiles: FileInfo[]
  selectedFolders: FolderInfo[]
  selectedImages: ImageInfo[]
}
