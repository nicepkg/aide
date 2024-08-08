import { t } from '@/i18n'
import * as vscode from 'vscode'

let aideKeyUsageStatusBar: vscode.StatusBarItem

export const initAideKeyUsageStatusBar = (context: vscode.ExtensionContext) => {
  aideKeyUsageStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  )
  aideKeyUsageStatusBar.text = `$(info) ${t('info.aideKeyUsageStatusBar.text')}`
  aideKeyUsageStatusBar.tooltip = t('info.aideKeyUsageStatusBar.tooltip')
  aideKeyUsageStatusBar.command = 'aide.showAideKeyUsageInfo'
  aideKeyUsageStatusBar.show()

  context.subscriptions.push(aideKeyUsageStatusBar)
}

export const updateAideKeyUsageStatusBar = (text: string) => {
  aideKeyUsageStatusBar.text = text
}
