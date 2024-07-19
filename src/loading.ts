import * as vscode from 'vscode'

import { t } from './i18n'

export const createLoading = () => {
  let progressResolve: (() => void) | undefined
  let progressInterval: NodeJS.Timeout | undefined

  const updateProgress = (
    progress: vscode.Progress<{ increment: number }>,
    token: vscode.CancellationToken
  ) => {
    let currentProgress = 0
    const increment = 1 // 1% each time

    progressInterval = setInterval(() => {
      if (token.isCancellationRequested) {
        clearInterval(progressInterval!)
        progressResolve?.()
        progressResolve = undefined
        return
      }

      currentProgress += increment
      if (currentProgress > 100) {
        currentProgress = 0
        progress.report({ increment: -100 })
      }
      progress.report({ increment })
    }, 50)
  }

  const showProcessLoading = async (options?: {
    title?: string
    onCancel?: () => void
  }) => {
    const { title = t('info.processing'), onCancel } = options ?? {}
    // Clear the previous progress
    progressResolve?.()

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: true
      },
      async (progress, token) =>
        new Promise<void>(resolve => {
          progressResolve = resolve

          token.onCancellationRequested(() => {
            clearInterval(progressInterval!)
            onCancel?.()
            hideProcessLoading()
          })

          updateProgress(progress, token)
        })
    )
  }

  const hideProcessLoading = () => {
    clearInterval(progressInterval!)
    progressResolve?.()
    progressResolve = undefined
  }

  return {
    showProcessLoading,
    hideProcessLoading
  }
}
