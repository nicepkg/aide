import type { FileInfo, FolderInfo } from '@extension/file-utils/traverse-fs'

export interface CodeSnippet {
  fileHash: string
  relativePath: string
  fullPath: string
  startLine: number
  startCharacter: number
  endLine: number
  endCharacter: number
  code: string
}

export interface CodeChunk {
  code: string
  language: string
  relativePath?: string
  fullPath?: string
  startLine?: number
  endLine?: number
}

export interface ImageInfo {
  url: string
}

export interface FsPluginState {
  selectedFilesFromFileSelector: FileInfo[]
  selectedFilesFromEditor: FileInfo[]
  currentFilesFromVSCode: FileInfo[]
  selectedFoldersFromEditor: FolderInfo[]
  selectedImagesFromOutsideUrl: ImageInfo[]
  codeChunksFromEditor: CodeChunk[]
  codeSnippetFromAgent: CodeSnippet[]
  enableCodebaseAgent: boolean
}
