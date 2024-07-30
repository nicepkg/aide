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
  const toFileContent = toFileDocument.getText()
  const fromFileEditor = vscode.window.visibleTextEditors.find(
    editor => editor.document.uri.toString() === fromFileUri.toString()
  )
  const isFromFileHasSelection =
    fromFileEditor &&
    fromFileEditor.document.uri.toString() === fromFileUri.toString() &&
    !fromFileEditor.selection.isEmpty

  if (isFromFileHasSelection) {
    // replace the content with the toFileContent
    await fromFileEditor.edit(editBuilder => {
      editBuilder.replace(fromFileEditor.selection, toFileContent)
    })
  } else {
    await VsCodeFS.writeFile(fromFileUri.fsPath, toFileContent, 'utf8')
  }

  vscode.window.showInformationMessage(t('info.fileReplaceSuccess'))

  // close the toFileUri
  await vscode.commands.executeCommand(
    'aide.quickCloseFileWithoutSave',
    toFileUri
  )

  // delete the toFileUri
  await VsCodeFS.unlink(toFileUri.fsPath)

  // if fromFileUri is not opened, open it
  const fromFileDocument = await vscode.workspace.openTextDocument(fromFileUri)
  await vscode.window.showTextDocument(fromFileDocument)
}
