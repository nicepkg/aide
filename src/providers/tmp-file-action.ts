import { getOriginalFileUri, isTmpFileUri } from '@/file-utils/create-tmp-file'
import { t } from '@/i18n'
import * as vscode from 'vscode'

export class TmpFileActionCodeLensProvider implements vscode.CodeLensProvider {
  private codeLenses: vscode.CodeLens[] = []

  private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>()

  public readonly onDidChangeCodeLenses: vscode.Event<void> =
    this._onDidChangeCodeLenses.event

  constructor() {
    vscode.workspace.onDidChangeConfiguration(_ => {
      this._onDidChangeCodeLenses.fire()
    })
  }

  public provideCodeLenses(
    document: vscode.TextDocument
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    if (!isTmpFileUri(document.uri)) return []

    this.updateCodeLenses(document)
    return this.codeLenses
  }

  private updateCodeLenses(document: vscode.TextDocument): void {
    this.codeLenses = []
    const firstLineRange = new vscode.Range(0, 0, 0, 0)
    const tmpFileUri = document.uri
    const originFileUri = getOriginalFileUri(tmpFileUri)

    const commands: vscode.Command[] = [
      {
        title: `$(close) ${t('command.quickCloseFileWithoutSave')}`,
        command: 'aide.quickCloseFileWithoutSave',
        arguments: [tmpFileUri]
      },
      {
        title: `$(explorer-view-icon) ${t('command.copyFileText')}`,
        command: 'aide.copyFileText',
        arguments: [tmpFileUri]
      },
      {
        title: `$(diff) ${t('command.showDiff')}`,
        command: 'aide.showDiff',
        arguments: [originFileUri, tmpFileUri]
      },
      {
        title: `$(breakpoints-activate) ${t('command.replaceFile')}`,
        command: 'aide.replaceFile',
        arguments: [originFileUri, tmpFileUri]
      }
    ]

    commands.forEach(command => {
      this.codeLenses.push(new vscode.CodeLens(firstLineRange, command))
    })
  }
}
