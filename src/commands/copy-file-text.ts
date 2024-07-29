import { t } from '@/i18n'
import * as vscode from 'vscode'

export const handleCopyFileText = async (uri?: vscode.Uri) => {
  const targetUri = uri || vscode.window.activeTextEditor?.document.uri

  if (!targetUri) throw new Error(t('error.noActiveEditor'))

  const document = await vscode.workspace.openTextDocument(targetUri)
  await vscode.env.clipboard.writeText(document.getText())
  vscode.window.showInformationMessage(t('info.copied'))
}
