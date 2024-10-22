import { getOriginalFileUri } from '@extension/file-utils/tmp-file/get-original-file-uri'
import { isTmpFileUri } from '@extension/file-utils/tmp-file/is-tmp-file-uri'
import { t } from '@extension/i18n'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'

class TmpFileActionCodeLensProvider implements vscode.CodeLensProvider {
  private codeLenses: vscode.CodeLens[] = []

  private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>()

  readonly onDidChangeCodeLenses: vscode.Event<void> =
    this._onDidChangeCodeLenses.event

  private disposes: vscode.Disposable[] = []

  constructor() {
    this.disposes.push(
      vscode.workspace.onDidChangeConfiguration(_ => {
        this._onDidChangeCodeLenses.fire()
      })
    )
  }

  provideCodeLenses(
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

  dispose(): void {
    this.disposes.forEach(dispose => dispose.dispose())
    this.disposes = []
  }
}

export class TmpFileActionRegister extends BaseRegister {
  private disposes: vscode.Disposable[] = []

  register(): void {
    const tmpFileActionCodeLensProvider = new TmpFileActionCodeLensProvider()

    // register CodeLensProvider, only for file name contains .aide
    this.disposes.push(
      vscode.languages.registerCodeLensProvider(
        { scheme: '*', pattern: '**/*.aide*' },
        tmpFileActionCodeLensProvider
      )
    )

    this.disposes.push(tmpFileActionCodeLensProvider)
  }

  dispose(): void {
    this.disposes.forEach(dispose => dispose.dispose())
    this.disposes = []
  }
}
