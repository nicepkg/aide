import type { BaseContextInfo } from './base-context'

export interface CodeChunk extends BaseContextInfo {
  code: string
  language: string

  relativePath?: string
  fullPath?: string
  startLine?: number
  endLine?: number
}

export interface CodeContext {
  codeChunks: CodeChunk[]
}
