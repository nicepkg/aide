import type { CommandManager } from '@extension/commands/command-manager'
import * as vscode from 'vscode'

import type { RegisterManager } from './register-manager'

export abstract class BaseRegister {
  constructor(
    protected context: vscode.ExtensionContext,
    protected registerManager: RegisterManager,
    protected commandManager: CommandManager
  ) {}

  abstract register(): void | Promise<void>

  dispose(): Promise<void> | void {}
}
