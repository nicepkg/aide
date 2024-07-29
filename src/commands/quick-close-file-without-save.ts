import { t } from '@/i18n'
import * as vscode from 'vscode'

export const handleQuickCloseFileWithoutSave = async (uri?: vscode.Uri) => {
  const targetUri = uri || vscode.window.activeTextEditor?.document.uri
  if (!targetUri) throw new Error(t('error.noActiveEditor'))

  const targetEditor = vscode.window.visibleTextEditors.find(
    editor => editor.document.uri.toString() === targetUri.toString()
  )

  let documentToClose: vscode.TextDocument | undefined

  if (targetEditor) {
    documentToClose = targetEditor.document
  } else {
    documentToClose = vscode.workspace.textDocuments.find(
      doc => doc.uri.toString() === targetUri.toString()
    )
  }

  if (!documentToClose) throw new Error(t('error.noActiveEditor'))

  await vscode.window.showTextDocument(documentToClose)

  const command = documentToClose.isDirty
    ? 'workbench.action.revertAndCloseActiveEditor'
    : 'workbench.action.closeActiveEditor'

  await vscode.commands.executeCommand(command)
}
