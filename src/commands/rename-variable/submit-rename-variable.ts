import { t } from '@/i18n'
import * as vscode from 'vscode'

export const submitRenameVariable = async ({
  newName,
  selection
}: {
  newName: string
  selection: vscode.Selection
}) => {
  const editor = vscode.window.activeTextEditor

  if (!editor) throw new Error(t('error.noActiveEditor'))

  const { document } = editor
  const position = selection.start

  // find all references
  const references = await vscode.commands.executeCommand<vscode.Location[]>(
    'vscode.executeReferenceProvider',
    document.uri,
    position
  )

  // create a workspace edit
  const edit = new vscode.WorkspaceEdit()

  if (references && references.length > 0) {
    // if references found, change all references
    references.forEach(reference => {
      edit.replace(reference.uri, reference.range, newName)
    })
  } else {
    // if no references found, only change the selected position
    edit.replace(
      document.uri,
      new vscode.Range(selection.start, selection.end),
      newName
    )
  }

  // apply the workspace edit
  await vscode.workspace.applyEdit(edit)
  await document.save()
}
