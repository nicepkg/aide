import { VsCodeFS } from '@/file-utils/vscode-fs'
import { t } from '@/i18n'
import * as vscode from 'vscode'

/**
 * Handles the replacement of a file with another file.
 *
 * @param fromFileUri - The file will not removed, but its content will be replaced.
 * @param toFileUri - The file will be removed.
 * @throws An error if either `fromFileUri` or `toFileUri` is not provided.
 */
export const handleReplaceFile = async (
  fromFileUri: vscode.Uri,
  toFileUri: vscode.Uri
) => {
  if (!fromFileUri || !toFileUri) throw new Error(t('error.fileNotFound'))

  const toFileDocument = await vscode.workspace.openTextDocument(toFileUri)

  await VsCodeFS.writeFile(fromFileUri.fsPath, toFileDocument.getText(), 'utf8')

  vscode.window.showInformationMessage(t('info.fileReplaceSuccess'))

  // close the toFileUri
  await vscode.commands.executeCommand(
    'aide.quickCloseFileWithoutSave',
    toFileUri
  )

  // if fromFileUri is not opened, open it
  const fromFileDocument = await vscode.workspace.openTextDocument(fromFileUri)
  await vscode.window.showTextDocument(fromFileDocument)
}
