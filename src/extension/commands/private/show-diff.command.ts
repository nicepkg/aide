import path from 'path'
import { t } from '@extension/i18n'
import * as vscode from 'vscode'

import { BaseCommand } from '../base.command'

enum DiffMode {
  WithClipboard = 'clipboard',
  WithFile = 'file'
}

interface FromFileInfo {
  uri: vscode.Uri
  title: string
}

export class ShowDiffCommand extends BaseCommand {
  private readonly DEFAULT_VIEW_COLUMN = vscode.ViewColumn.One

  get commandName(): string {
    return 'aide.showDiff'
  }

  async run(
    fromFileUri: vscode.Uri,
    toFileUri?: vscode.Uri,
    closeToFile = false
  ): Promise<void> {
    if (!fromFileUri) throw new Error(t('error.fileNotFound'))

    const fromFileInfo = await this.prepareFromFile(fromFileUri)
    await this.prepareToFile(toFileUri, closeToFile)

    const diffMode = this.getDiffMode(toFileUri, closeToFile)
    await this.showDiff(diffMode, fromFileInfo, toFileUri)
  }

  private async prepareFromFile(
    fromFileUri: vscode.Uri
  ): Promise<FromFileInfo> {
    const fromFileEditor = this.findVisibleEditor(fromFileUri)
    const hasSelection =
      fromFileEditor?.selection && !fromFileEditor.selection.isEmpty

    if (hasSelection) {
      return this.handleSelectedContent(fromFileUri, fromFileEditor!)
    }
    return {
      uri: fromFileUri,
      title: path.basename(fromFileUri.fsPath)
    }
  }

  private findVisibleEditor(
    fileUri: vscode.Uri
  ): vscode.TextEditor | undefined {
    return vscode.window.visibleTextEditors.find(
      editor => editor.document.uri.toString() === fileUri.toString()
    )
  }

  private async handleSelectedContent(
    fromFileUri: vscode.Uri,
    fromFileEditor: vscode.TextEditor
  ): Promise<FromFileInfo> {
    const title = `${path.basename(fromFileUri.fsPath)} (Selection)`
    const selectedContent = fromFileEditor.document.getText(
      fromFileEditor.selection
    )
    const inMemoryDocument = await vscode.workspace.openTextDocument({
      content: selectedContent,
      language: fromFileEditor.document.languageId
    })
    return { uri: inMemoryDocument.uri, title }
  }

  private async prepareToFile(
    toFileUri?: vscode.Uri,
    closeToFile = false
  ): Promise<void> {
    if (!toFileUri) return

    const isToFileVisible = this.findVisibleEditor(toFileUri) !== undefined

    if (isToFileVisible) {
      await this.moveToFileToFirstColumn(toFileUri)
    } else {
      await vscode.window.showTextDocument(toFileUri, {
        viewColumn: this.DEFAULT_VIEW_COLUMN
      })
    }

    if (closeToFile) {
      await this.copyToFileContentToClipboard(toFileUri)
      await this.closeToFile(toFileUri)
    }
  }

  private async moveToFileToFirstColumn(toFileUri: vscode.Uri): Promise<void> {
    const toFileEditor = await vscode.window.showTextDocument(toFileUri, {
      viewColumn: this.DEFAULT_VIEW_COLUMN
    })
    await this.closeFileInOtherColumns(toFileUri)
    await vscode.window.showTextDocument(toFileEditor.document)
  }

  private async copyToFileContentToClipboard(
    toFileUri: vscode.Uri
  ): Promise<void> {
    const toFileDocument = await vscode.workspace.openTextDocument(toFileUri)
    await vscode.env.clipboard.writeText(toFileDocument.getText())
  }

  private async closeToFile(toFileUri: vscode.Uri): Promise<void> {
    await vscode.commands.executeCommand(
      'aide.quickCloseFileWithoutSave',
      toFileUri
    )
  }

  private getDiffMode(toFileUri?: vscode.Uri, closeToFile = false): DiffMode {
    return !toFileUri || closeToFile
      ? DiffMode.WithClipboard
      : DiffMode.WithFile
  }

  private async showDiff(
    mode: DiffMode,
    fromFileInfo: FromFileInfo,
    toFileUri?: vscode.Uri
  ): Promise<void> {
    switch (mode) {
      case DiffMode.WithClipboard:
        await vscode.commands.executeCommand(
          'workbench.files.action.compareWithClipboard',
          fromFileInfo.uri
        )
        break
      case DiffMode.WithFile:
        if (toFileUri) {
          const toFileTitle = path.basename(toFileUri.fsPath)
          const title = `Diff: ${fromFileInfo.title} ↔ ${toFileTitle}`
          const options: vscode.TextDocumentShowOptions = {
            viewColumn: this.DEFAULT_VIEW_COLUMN
          }
          await vscode.commands.executeCommand(
            'vscode.diff',
            toFileUri,
            fromFileInfo.uri,
            title,
            options
          )
        }
        break
      default:
        break
    }
  }

  private async closeFileInOtherColumns(fileUri: vscode.Uri): Promise<void> {
    const editorsToClose = vscode.window.visibleTextEditors.filter(
      editor =>
        editor.document.uri.toString() === fileUri.toString() &&
        editor.viewColumn !== this.DEFAULT_VIEW_COLUMN
    )

    for (const editor of editorsToClose) {
      await vscode.window.showTextDocument(editor.document, {
        preserveFocus: false,
        preview: false,
        viewColumn: editor.viewColumn
      })
      await vscode.commands.executeCommand(
        'workbench.action.closeEditorsAndGroup'
      )
    }
  }
}
