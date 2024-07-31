import * as path from 'path'
import { t } from '@/i18n'
import * as vscode from 'vscode'

/**
 * Displays a diff view between two files or between a file and a selected portion of another file.
 *
 * @param fromFileUri - The URI of the source file.
 * @param toFileUri - The URI of the target file to compare against.
 * @throws An error if either `fromFileUri` or `toFileUri` is not provided.
 */
export const handleShowDiff = async (
  fromFileUri: vscode.Uri,
  toFileUri: vscode.Uri
) => {
  if (!fromFileUri || !toFileUri) throw new Error(t('error.fileNotFound'))

  const fromFileEditor = vscode.window.visibleTextEditors.find(
    editor => editor.document.uri.toString() === fromFileUri.toString()
  )

  let fromFileTitle: string
  let finalFromFileUri: vscode.Uri

  if (fromFileEditor && !fromFileEditor.selection.isEmpty) {
    // Use selected content from fromFile
    fromFileTitle = `${path.basename(fromFileUri.fsPath)} (Selection)`
    finalFromFileUri = vscode.Uri.parse(`untitled:${fromFileTitle}`)

    // Create an in-memory document with the selected content
    const selectedContent = fromFileEditor.document.getText(
      fromFileEditor.selection
    )
    const inMemoryDocument = await vscode.workspace.openTextDocument({
      content: selectedContent,
      language: fromFileEditor.document.languageId
    })
    finalFromFileUri = inMemoryDocument.uri
  } else {
    // Use entire content of fromFile
    finalFromFileUri = fromFileUri
    fromFileTitle = path.basename(fromFileUri.fsPath)
  }

  const toFileTitle = path.basename(toFileUri.fsPath)

  // Show diff
  const title = `Diff: ${fromFileTitle} ↔ ${toFileTitle}`
  await vscode.commands.executeCommand(
    'vscode.diff',
    toFileUri,
    finalFromFileUri,
    title
  )
}
