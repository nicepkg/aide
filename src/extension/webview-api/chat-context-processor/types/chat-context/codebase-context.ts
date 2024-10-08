import type { BaseContextInfo, BaseToolContext } from './base-context'

export interface CodeSnippet extends BaseContextInfo {
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
