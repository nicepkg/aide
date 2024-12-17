import type { FileInfo, FolderInfo } from '@extension/file-utils/traverse-fs'
import type { Mention } from '@shared/entities'

import { PluginId } from '../base/types'

export enum FsMentionType {
  Files = `${PluginId.Fs}#files`,
  File = `${PluginId.Fs}#file`,
  Folders = `${PluginId.Fs}#folders`,
  Folder = `${PluginId.Fs}#folder`,
  Trees = `${PluginId.Fs}#trees`,
  Tree = `${PluginId.Fs}#tree`,
  Code = `${PluginId.Fs}#code`,
  Codebase = `${PluginId.Fs}#codebase`,
  Errors = `${PluginId.Fs}#errors`
}

export type FileMention = Mention<FsMentionType.File, FileInfo>
export type FolderMention = Mention<FsMentionType.Folder, FolderInfo>
export type TreeMention = Mention<FsMentionType.Tree, TreeInfo>
export type CodeMention = Mention<FsMentionType.Code, CodeChunk>
export type CodebaseMention = Mention<FsMentionType.Codebase, CodeSnippet[]>
export type ErrorMention = Mention<FsMentionType.Errors, EditorError[]>

export type FsMention =
  | FileMention
  | FolderMention
  | TreeMention
  | CodeMention
  | CodebaseMention
  | ErrorMention

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

export interface EditorError {
  message: string
  code?: string
  severity: 'error' | 'warning'
  file: string
  line: number
  column: number
}

export interface TreeInfo {
  type: 'tree'
  fullPath: string // root folder full path
  relativePath: string // root folder relative path
  treeString: string // markdown tree string, for user reading
  listString: string // markdown list string, for ai reading
}

export interface FsPluginState {}
