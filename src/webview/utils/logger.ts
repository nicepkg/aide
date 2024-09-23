/* eslint-disable @typescript-eslint/no-empty-function */
import { BaseLogger } from '@shared/utils/base-logger'

export class WebviewLogger extends BaseLogger {
  protected isDev(): boolean {
    return process.env.NODE_ENV !== 'production'
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  protected outputLog(message: string): void {
    // send the log back to the VSCode extension
    // this.vscode.postMessage({
    //   type: 'log',
    //   message
    // })
  }

  async saveLogsToFile(): Promise<void> {}

  destroy(): void {}
}

export const logger = new WebviewLogger({ name: 'Aide.webview', level: 'info' })
