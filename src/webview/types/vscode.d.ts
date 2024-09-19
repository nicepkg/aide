import type { WebviewToExtensionsMsg } from '@shared/types'

declare global {
  interface VSCodeWebviewState {
    socketPort?: number
  }
  interface Window {
    isWin: boolean
    acquireVsCodeApi(): {
      postMessage(msg: WebviewToExtensionsMsg): void
      setState(state: any): void
      getState(): any
    }
    vscode: ReturnType<typeof window.acquireVsCodeApi>
    vscodeWebviewState?: VSCodeWebviewState
  }
}
