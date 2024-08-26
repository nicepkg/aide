export interface CodeRange {
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

export interface CodeChunk {
  /**
   * @example 'src/webview/types/vscode.d.ts'
   */
  relativePath: string

  /**
   * @example { startPosition: { line: 1, column: 1 }, endPosition: { line: 10, column: 10 } }
   */
  range: CodeRange

  /**
   * @example  "import type { WebviewToExtensionsMsg } from '@shared/types'\n\ndeclare global {\n  interface Window {\n    acquireVsCodeApi(): {\n      postMessage(msg: WebviewToExtensionsMsg): void\n      setState(state: any): void\n      getState(): any\n    }\n    vscode: ReturnType<typeof window.acquireVsCodeApi>\n  }\n}"
   */
  code: string
}

export interface TmpCodeChunk {
  language: string
  code: string
}

export interface CodeContext {
  tmpCodeChunk: TmpCodeChunk[]
  codeChunks: CodeChunk[]
}
