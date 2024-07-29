import { t } from '@/i18n'
import type { MaybePromise } from '@/types'
import * as vscode from 'vscode'

/**
 * Shows a continue message if the number of lines in the temporary file is less than the original file content line count minus a threshold.
 * If the user chooses to continue, the `onContinue` callback is executed.
 * @param tmpFileUri - The URI of the temporary file.
 * @param originalFileContentLineCount - The number of lines in the original file.
 * @param lineCountDiffThreshold - The threshold for the difference in line count between the temporary file and the original file. Default is 100.
 * @param continueMessage - The message to display when asking the user to continue. Default is 'info.continueMessage'.
 * @param onContinue - The callback function to execute when the user chooses to continue.
 */
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
