import * as vscode from 'vscode'

import { getOriginalFileUri, isTmpFileUri } from './file-utils/create-tmp-file'
import { VsCodeFS } from './file-utils/vscode-fs'
import { logger } from './logger'

let isHandlingEditorChange = false

const openCorrespondingFiles = async (tmpUri: vscode.Uri): Promise<void> => {
  if (isHandlingEditorChange || !isTmpFileUri(tmpUri)) return
  isHandlingEditorChange = true
  const originalUri = getOriginalFileUri(tmpUri)

  try {
    // check if the original file exists
    await VsCodeFS.stat(originalUri.fsPath)

    // open original file
    const originalDocument =
      await vscode.workspace.openTextDocument(originalUri)
    await vscode.window.showTextDocument(
      originalDocument,
      vscode.ViewColumn.One
    )

    // 重新聚焦到 .aide.vue 文件
    // refocus on the .aide file
    const tmpDocument = await vscode.workspace.openTextDocument(tmpUri)
    await vscode.window.showTextDocument(tmpDocument, vscode.ViewColumn.Two)
  } catch (e) {
    logger.warn('openCorrespondingFiles error', e)
  } finally {
    isHandlingEditorChange = false
  }
}

export const autoOpenCorrespondingFiles = (
  context: vscode.ExtensionContext
) => {
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(async document => {
      const maybeTmpUri = document.uri
      if (isTmpFileUri(maybeTmpUri)) {
        await openCorrespondingFiles(maybeTmpUri)
      }
    })
  )

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      const maybeTmpUri = editor?.document.uri
      if (maybeTmpUri && isTmpFileUri(maybeTmpUri) && !isHandlingEditorChange) {
        openCorrespondingFiles(maybeTmpUri)
      }
    })
  )
}
