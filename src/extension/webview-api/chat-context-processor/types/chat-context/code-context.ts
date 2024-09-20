export interface CodeChunk {
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
