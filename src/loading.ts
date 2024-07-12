import * as vscode from 'vscode'

import { t } from './i18n'

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

let progressResolve: (() => void) | undefined

export const showProcessLoading = async (title = t('info.processing')) => {
  if (progressResolve) {
    // if there is already a progress bar showing, close it first
    progressResolve()
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title,
      cancellable: true
    },
    async progress =>
      new Promise<void>(resolve => {
        progressResolve = resolve

        const updateProgress = () => {
          let currentProgress = 0
          const increment = 1 // 1% each time, increment can be adjusted as needed

          const progressInterval = setInterval(() => {
            if (progressResolve) {
              currentProgress += increment

              if (currentProgress > 100) {
                currentProgress = 0
                progress.report({
                  increment: -100
                })
              }

              progress.report({
                increment
                // message: `${currentProgress}%`
              })
            } else {
              clearInterval(progressInterval)
              resolve()
            }
          }, 50) // Update every 100 milliseconds, can be adjusted as needed
        }

        updateProgress()
      })
  )
}

export const hideProcessLoading = () => {
  if (progressResolve) {
    progressResolve()
    progressResolve = undefined
  }
}
