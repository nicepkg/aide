import * as vscode from 'vscode'

import { BaseCommand } from './base.command'

export class CommandManager {
  private commands: BaseCommand[] = []

  private services: Map<string, any> = new Map()

  constructor(private context: vscode.ExtensionContext) {}

  registerCommand(
    CommandClass: new (
      ...args: ConstructorParameters<typeof BaseCommand>
    ) => BaseCommand
  ): void {
    const command = new CommandClass(this.context, this)
    this.commands.push(command)
    this.context.subscriptions.push(command.register())
  }

  registerService(name: string, service: any): void {
    this.services.set(name, service)
  }

  getService(name: string): any {
    return this.services.get(name)
  }

  async cleanup(): Promise<void> {
    await Promise.allSettled(this.commands.map(command => command.cleanup()))
  }
}
