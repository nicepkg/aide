import type { CommandManager } from '@extension/commands/command-manager'
import * as vscode from 'vscode'

import { BaseRegister } from './base.register'

export class RegisterManager {
  private registers: BaseRegister[] = []

  constructor(
    private context: vscode.ExtensionContext,
    public commandManager: CommandManager
  ) {}

  async setupRegister(
    RegisterClass: new (
      ...args: ConstructorParameters<typeof BaseRegister>
    ) => BaseRegister
  ): Promise<void> {
    const register = new RegisterClass(this.context, this, this.commandManager)
    await register.register()
    this.registers.push(register)
  }

  async cleanup(): Promise<void> {
    await Promise.allSettled(this.registers.map(register => register.cleanup()))
  }
}
