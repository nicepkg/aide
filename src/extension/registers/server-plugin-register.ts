import type { CommandManager } from '@extension/commands/command-manager'
import { createServerPlugins } from '@shared/plugins/base/server/create-server-plugins'
import { ServerPluginRegistry } from '@shared/plugins/base/server/server-plugin-registry'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'
import type { RegisterManager } from './register-manager'

export class ServerPluginRegister extends BaseRegister {
  serverPluginRegistry!: ServerPluginRegistry

  constructor(
    protected context: vscode.ExtensionContext,
    protected registerManager: RegisterManager,
    protected commandManager: CommandManager
  ) {
    super(context, registerManager, commandManager)
  }

  async register(): Promise<void> {
    const serverPluginRegistry = new ServerPluginRegistry()
    const plugins = createServerPlugins()

    await Promise.allSettled(
      plugins.map(plugin => serverPluginRegistry.loadPlugin(plugin))
    )

    this.serverPluginRegistry = serverPluginRegistry
  }

  async dispose(): Promise<void> {
    await this.serverPluginRegistry.unloadAllPlugins()
  }
}
