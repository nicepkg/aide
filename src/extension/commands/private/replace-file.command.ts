import path from 'path'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { t } from '@extension/i18n'
import * as vscode from 'vscode'

import { BaseCommand } from '../base.command'

export class ReplaceFileCommand extends BaseCommand {
  get commandName(): string {
    return 'aide.replaceFile'
  }

  async run(fromFileUri: vscode.Uri, toFileUri: vscode.Uri): Promise<void> {
    if (!fromFileUri || !toFileUri) throw new Error(t('error.fileNotFound'))

    const toFileContent = (
      await vscode.workspace.openTextDocument(toFileUri)
    ).getText()
    await this.replaceFileContent(fromFileUri, toFileContent)

    vscode.window.showInformationMessage(t('info.fileReplaceSuccess'))

    // close the toFileUri
    await vscode.commands.executeCommand(
      'aide.quickCloseFileWithoutSave',
      toFileUri
    )

    // get toFileExt and set it to fromFileUri
    const toFileExt = path.extname(toFileUri.fsPath)
    if (toFileExt) {
      fromFileUri = await this.changeFileExtension(fromFileUri, toFileExt)
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

  async replaceFileContent(uri: vscode.Uri, content: string) {
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

  async changeFileExtension(
    uri: vscode.Uri,
    newExt: string
  ): Promise<vscode.Uri> {
    const oldPath = uri.fsPath
    const dir = path.dirname(oldPath)
    const nameWithoutExt = path.basename(oldPath, path.extname(oldPath))
    const newPath = path.join(dir, `${nameWithoutExt}${newExt}`)
    const newUri = vscode.Uri.file(newPath)
    await vscode.workspace.fs.rename(uri, newUri)
    return newUri
  }
}
