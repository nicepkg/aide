import { getOriginalFileUri } from '@extension/file-utils/tmp-file/get-original-file-uri'
import { isTmpFileUri } from '@extension/file-utils/tmp-file/is-tmp-file-uri'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { logger } from '@extension/logger'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'

export class AutoOpenCorrespondingFilesRegister extends BaseRegister {
  private isHandlingEditorChange = false

  register(): void {
    // this.context.subscriptions.push(
    //   vscode.workspace.onDidOpenTextDocument(
    //     this.handleDocumentOpen.bind(this)
    //   ),
    //   vscode.window.onDidChangeActiveTextEditor(
    //     this.handleEditorChange.bind(this)
    //   )
    // )
  }

  private async handleDocumentOpen(
    document: vscode.TextDocument
  ): Promise<void> {
    const maybeTmpUri = document.uri
    if (isTmpFileUri(maybeTmpUri)) {
      await this.openCorrespondingFiles(maybeTmpUri)
    }
  }

  private handleEditorChange(editor: vscode.TextEditor | undefined): void {
    const maybeTmpUri = editor?.document.uri
    if (
      maybeTmpUri &&
      isTmpFileUri(maybeTmpUri) &&
      !this.isHandlingEditorChange
    ) {
      this.openCorrespondingFiles(maybeTmpUri)
    }
  }

  private async openCorrespondingFiles(tmpUri: vscode.Uri): Promise<void> {
    if (this.isHandlingEditorChange || !isTmpFileUri(tmpUri)) return
    this.isHandlingEditorChange = true
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

      // refocus on the .aide file
      const tmpDocument = await vscode.workspace.openTextDocument(tmpUri)
      await vscode.window.showTextDocument(tmpDocument, vscode.ViewColumn.Two)
    } catch (e) {
      logger.warn('openCorrespondingFiles error', e)
    } finally {
      this.isHandlingEditorChange = false
    }
  }
}
