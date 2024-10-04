import { logger } from '@extension/logger'
import * as vscode from 'vscode'

import { BaseCommand } from './base.command'

export class CommandManager {
  private commands: Map<string, BaseCommand> = new Map()

  private services: Map<string, any> = new Map()

  constructor(private context: vscode.ExtensionContext) {}

  registerCommand(
    CommandClass: new (
      ...args: ConstructorParameters<typeof BaseCommand>
    ) => BaseCommand
  ): void {
    try {
      const command = new CommandClass(this.context, this)
      this.commands.set(CommandClass.name, command)
      this.context.subscriptions.push(command.register())
    } catch (e) {
      logger.error(`Failed to register command: ${CommandClass.name}`, e)
    }
  }

  getCommand<T extends BaseCommand>(
    CommandClass: new (...args: any[]) => T
  ): T | undefined {
    return this.commands.get(CommandClass.name) as T | undefined
  }

  registerService(name: string, service: any): void {
    this.services.set(name, service)
  }

  getService<T>(name: string): T | undefined {
    return this.services.get(name) as T | undefined
  }

  async dispose(): Promise<void> {
    await Promise.allSettled(
      Array.from(this.commands.values()).map(command => command.dispose())
    )
  }
}
