import * as vscode from 'vscode'

import { t } from './i18n'

export const createLoading = () => {
  let progressResolve: (() => void) | undefined

  const showProcessLoading = async (title = t('info.processing')) => {
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

  const hideProcessLoading = () => {
    if (progressResolve) {
      progressResolve()
      progressResolve = undefined
    }
  }

  return {
    showProcessLoading,
    hideProcessLoading
  }
}
