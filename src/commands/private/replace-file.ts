import path from 'path'
import { VsCodeFS } from '@/file-utils/vscode-fs'
import { t } from '@/i18n'
import * as vscode from 'vscode'

const replaceFileContent = async (uri: vscode.Uri, content: string) => {
  const editor = vscode.window.visibleTextEditors.find(
    e => e.document.uri.toString() === uri.toString()
  )
  if (editor && !editor.selection.isEmpty) {
    await editor.edit(editBuilder =>
      editBuilder.replace(editor.selection, content)
    )
  } else {
    await VsCodeFS.writeFile(uri.fsPath, content, 'utf8')
  }
}

const changeFileExtension = async (
  uri: vscode.Uri,
  newExt: string
): Promise<vscode.Uri> => {
  const oldPath = uri.fsPath
  const dir = path.dirname(oldPath)
  const nameWithoutExt = path.basename(oldPath, path.extname(oldPath))
  const newPath = path.join(dir, `${nameWithoutExt}${newExt}`)
  const newUri = vscode.Uri.file(newPath)
  await vscode.workspace.fs.rename(uri, newUri)
  return newUri
}

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

  const toFileContent = (
    await vscode.workspace.openTextDocument(toFileUri)
  ).getText()
  await replaceFileContent(fromFileUri, toFileContent)

  vscode.window.showInformationMessage(t('info.fileReplaceSuccess'))

  // close the toFileUri
  await vscode.commands.executeCommand(
    'aide.quickCloseFileWithoutSave',
    toFileUri
  )

  // get toFileExt and set it to fromFileUri
  const toFileExt = path.extname(toFileUri.fsPath)
  if (toFileExt) {
    fromFileUri = await changeFileExtension(fromFileUri, toFileExt)
  }

  try {
    // delete the toFileUri
    await VsCodeFS.unlink(toFileUri.fsPath)

    // if fromFileUri is not opened, open it
    const fromFileDocument =
      await vscode.workspace.openTextDocument(fromFileUri)
    await vscode.window.showTextDocument(fromFileDocument)
  } catch {}
}
