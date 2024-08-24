import * as vscode from 'vscode'

export const AIDE_TMP_FILE_REGEX = /\.aide(\.[^.]+)?$/

export const isTmpFileUri = (
  uri: vscode.Uri,
  requireUntitled = false
): boolean => {
  const isTmpFile = AIDE_TMP_FILE_REGEX.test(uri.fsPath)
  return requireUntitled ? isTmpFile && uri.scheme === 'untitled' : isTmpFile
}
