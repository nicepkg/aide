import type { CodeBlock } from '../code-block'

export interface CodeChunk {
  /**
   * Relative path of the code chunk in the workspace.
   * @example 'src/extension/index.ts'
   */
  relativeWorkspacePath: string

  /**
   * Start line number of the code chunk.
   * @example 1
   */
  startLineNumber: number

  /**
   * Lines of code in the chunk.
   * @example [
   *  "export const sleep = (ms: number) =>',
   *  "  new Promise(resolve => setTimeout(resolve, ms))",
   * ]
   */
  lines: string[]

  /**
   * Strategy used for summarizing the code chunk.
   * @example 'SUMMARIZATION_STRATEGY_NONE_UNSPECIFIED'
   */
  summarizationStrategy: string

  /**
   * Language identifier of the code chunk.
   * @example 'typescript'
   */
  languageIdentifier: string
}

export interface CodebaseContextChunk {
  /**
   * @example 'src/webview/types/vscode.d.ts'
   */
  relativeWorkspacePath: string

  range: {
    startPosition: {
      /**
       * @example 1
       */
      line: number

      /**
       * @example 1
       */
      column: number
    }
    endPosition: {
      /**
       * @example 10
       */
      line: number

      /**
       * @example 2
       */
      column: number
    }
  }

  /**
   * @example  "import type { WebviewToExtensionsMsg } from '@shared/types'\n\ndeclare global {\n  interface Window {\n    acquireVsCodeApi(): {\n      postMessage(msg: WebviewToExtensionsMsg): void\n      setState(state: any): void\n      getState(): any\n    }\n    vscode: ReturnType<typeof window.acquireVsCodeApi>\n  }\n}"
   */
  contents: string
  detailedLines: {
    /**
     * @example 'declare global {'
     */
    text: string

    /**
     * @example 3
     */
    lineNumber: number

    /**
     * @example false
     */
    isSignature: boolean
  }[]
}

export interface CodeRelatedInfo {
  attachedCodeChunks: CodeChunk[]
  codebaseContextChunks: CodebaseContextChunk[]

  /**
   * modify files by ai
   */
  codeBlocks?: CodeBlock[]
  userModificationsToSuggestedCodeBlocks: any[]
}
