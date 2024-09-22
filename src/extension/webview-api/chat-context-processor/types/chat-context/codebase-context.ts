export interface CodeSnippet {
  fileHash: string
  relativePath: string
  fullPath: string
  startLine: number
  startCharacter: number
  endLine: number
  endCharacter: number
  embedding: number[]

  code: string
}

export interface CodebaseContext {
  relevantCodeSnippets: CodeSnippet[]
}
