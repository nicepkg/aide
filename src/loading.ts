import * as vscode from 'vscode'

let statusBarItem: vscode.StatusBarItem | undefined

export const showLoading = (text = 'Aide...', tooltip?: string) => {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    0
  )

  statusBarItem.text = `$(sync~spin) ${text}`
  statusBarItem.tooltip = tooltip ?? text
  statusBarItem.show()
}

export const hideLoading = () => {
  if (statusBarItem) {
    statusBarItem.dispose()
    statusBarItem = undefined
  }
}
