import type { CommandManager } from '@extension/commands/command-manager'
import {
  controllers,
  type Controllers
} from '@extension/webview-api/controllers'
import type { Controller } from '@extension/webview-api/types'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'
import type { RegisterManager } from './register-manager'

export class ControllerRegister extends BaseRegister {
  public controllers: Map<string, Controller> = new Map()

  constructor(
    protected context: vscode.ExtensionContext,
    protected registerManager: RegisterManager,
    protected commandManager: CommandManager
  ) {
    super(context, registerManager, commandManager)
  }

  async register(): Promise<void> {
    for (const ControllerClass of controllers) {
      const controller = new ControllerClass(
        this.registerManager,
        this.commandManager
      )
      this.controllers.set(controller.name, controller)
    }
  }

  api<T extends InstanceType<Controllers[number]>['name']>(
    apiName: T
  ): Extract<InstanceType<Controllers[number]>, { name: T }> {
    // Type assertion needed since Map.get doesn't preserve the exact type
    return this.controllers.get(apiName) as Extract<
      InstanceType<Controllers[number]>,
      { name: T }
    >
  }

  dispose(): void {
    this.controllers.clear()
  }
}
