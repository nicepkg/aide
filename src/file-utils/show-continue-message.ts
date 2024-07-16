import { t } from '@/i18n'
import type { MaybePromise } from '@/types'
import * as vscode from 'vscode'

export const showContinueMessage = async ({
  tmpFileUri,
  originalFileContentLineCount,
  lineCountDiffThreshold = 100,
  continueMessage = t('info.continueMessage'),
  onContinue
}: {
  tmpFileUri: vscode.Uri
  originalFileContentLineCount: number
  lineCountDiffThreshold?: number
  continueMessage?: string
  onContinue: () => MaybePromise<void>
}) => {
  const tmpFileDocument = vscode.workspace.textDocuments.find(
    document => document.uri.fsPath === tmpFileUri.fsPath
  )

  if (!tmpFileDocument) return

  // if the number of lines in the output file is more than xx lines less than the number of lines in the original file,
  // it may need to continue
  if (
    tmpFileDocument.lineCount <
    originalFileContentLineCount - lineCountDiffThreshold
  ) {
    const continueAction = t('info.continue')
    const cancelAction = t('info.cancel')

    const continueOption = await vscode.window.showInformationMessage(
      continueMessage,
      continueAction,
      cancelAction
    )

    if (continueOption === continueAction) {
      await onContinue()
    }
  }
}
