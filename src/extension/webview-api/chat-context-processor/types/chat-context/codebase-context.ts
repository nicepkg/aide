import type { BaseToolContext } from './base-tool-context'

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

export interface CodebaseContext extends BaseToolContext {
  relevantCodeSnippets: CodeSnippet[]
}
