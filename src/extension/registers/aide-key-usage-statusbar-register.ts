import { t } from '@extension/i18n'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'

export class AideKeyUsageStatusBarRegister extends BaseRegister {
  statusBar: vscode.StatusBarItem | undefined

  updateStatusBar(text: string): void {
    if (this.statusBar) {
      this.statusBar.text = text
    }
  }

  register(): void {
    this.statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    )

    const { statusBar } = this

    statusBar.text = `$(info) ${t('info.aideKeyUsageStatusBar.text')}`
    statusBar.tooltip = t('info.aideKeyUsageStatusBar.tooltip')
    statusBar.command = 'aide.showAideKeyUsageInfo'
    statusBar.show()

    this.context.subscriptions.push(statusBar)

    this.registerManager.commandManager.registerService(
      'AideKeyUsageStatusBarRegister',
      this
    )
  }

  dispose(): void | Promise<void> {
    this.statusBar?.dispose()
    this.statusBar = undefined
  }
}
