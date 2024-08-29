export interface CodeSnippet {
  relativePath: string
  fullPath: string
  startLine: number
  endLine: number
  code: string
  relevance: number
}

export interface CodebaseContext {
  relevantCodeSnippets: CodeSnippet[]
}
