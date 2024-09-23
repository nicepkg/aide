import * as path from 'path'
import { BaseLogger, type BaseLoggerOptions } from '@shared/utils/base-logger'
import * as vscode from 'vscode'

import { getContext } from './context'
import { aidePaths } from './file-utils/paths'
import { VsCodeFS } from './file-utils/vscode-fs'

export class VSCodeLogger extends BaseLogger {
  private vscodeOutputChannel: vscode.OutputChannel

  private _isDev: boolean | undefined

  constructor(options: BaseLoggerOptions) {
    super(options)
    this.vscodeOutputChannel = vscode.window.createOutputChannel(options.name, {
      log: true
    })
  }

  protected isDev(): boolean {
    if (this._isDev === undefined) {
      const context = getContext()
      this._isDev = context
        ? context.extensionMode !== vscode.ExtensionMode.Production
        : false
    }
    return this._isDev
  }

  protected outputLog(message: string): void {
    this.vscodeOutputChannel.appendLine(message)
  }

  async saveLogsToFile(): Promise<void> {
    const logsDir = aidePaths.getLogsPath()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `aide_logs_${timestamp}.log`
    const filePath = path.join(logsDir, fileName)

    const logContent = this.logBuffer.join('\n')

    await VsCodeFS.writeFile(filePath, logContent)

    this.log(`Logs saved to: ${filePath}`)
  }

  destroy(): void {
    this.vscodeOutputChannel.dispose()
  }
}

export const logger = new VSCodeLogger({ name: 'Aide', level: 'info' })
