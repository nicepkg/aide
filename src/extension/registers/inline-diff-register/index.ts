import type { CommandManager } from '@extension/commands/command-manager'
import { getErrorMsg } from '@shared/utils/common'
import * as vscode from 'vscode'

import { BaseRegister } from '../base-register'
import type { RegisterManager } from '../register-manager'
import { InlineDiffProvider } from './inline-diff-provider'

export class InlineDiffRegister extends BaseRegister {
  private disposables: vscode.Disposable[] = []

  public inlineDiffProvider!: InlineDiffProvider

  constructor(
    protected context: vscode.ExtensionContext,
    protected registerManager: RegisterManager,
    protected commandManager: CommandManager
  ) {
    super(context, registerManager, commandManager)
  }

  async register(): Promise<void> {
    this.inlineDiffProvider = new InlineDiffProvider()

    this.disposables.push(this.inlineDiffProvider)

    this.disposables.push(
      vscode.languages.registerCodeLensProvider(
        { scheme: '*' },
        this.inlineDiffProvider
      ),
      vscode.commands.registerCommand(
        'aide.inlineDiff.accept',
        this.inlineDiffProvider.acceptDiffs.bind(this.inlineDiffProvider)
      ),
      vscode.commands.registerCommand(
        'aide.inlineDiff.reject',
        this.inlineDiffProvider.rejectDiffs.bind(this.inlineDiffProvider)
      ),
      vscode.commands.registerCommand(
        'aide.inlineDiff.acceptAll',
        this.inlineDiffProvider.acceptAll.bind(this.inlineDiffProvider)
      ),
      vscode.commands.registerCommand(
        'aide.inlineDiff.rejectAll',
        this.inlineDiffProvider.rejectAll.bind(this.inlineDiffProvider)
      ),
      vscode.commands.registerCommand('aide.inlineDiff.showError', task => {
        if (task.error) {
          vscode.window.showErrorMessage(getErrorMsg(task.error))
        }
      })
    )
  }

  async dispose() {
    this.disposables.forEach(disposable => disposable.dispose())
    this.disposables = []
  }
}
