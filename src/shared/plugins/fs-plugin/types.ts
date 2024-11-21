import type { FileInfo, FolderInfo } from '@extension/file-utils/traverse-fs'
import type { BaseConversationLog } from '@shared/entities'

import type { PluginId } from '../base/types'

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

export interface EditorError {
  message: string
  code?: string
  severity: 'error' | 'warning'
  file: string
  line: number
  column: number
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
  editorErrors: EditorError[]
}

export interface FsPluginLog extends BaseConversationLog {
  pluginId: PluginId.Fs
  codeSnippets?: CodeSnippet[]
}
