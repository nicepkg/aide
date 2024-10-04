import { commandWithCatcher } from '@extension/utils'
import * as vscode from 'vscode'

import type { CommandManager } from './command-manager'

export abstract class BaseCommand {
  constructor(
    protected context: vscode.ExtensionContext,
    protected commandManager: CommandManager
  ) {}

  abstract get commandName(): string

  abstract run(...args: any[]): Promise<void>

  dispose(): Promise<void> | void {}

  register(): vscode.Disposable {
    return vscode.commands.registerCommand(
      this.commandName,
      commandWithCatcher(this.run.bind(this))
    )
  }
}
