import { logger } from '@extension/logger'

import type { PluginId } from '../types'
import { createProviderManagers } from './create-provider-manager'
import { ServerPluginContext, type ServerPlugin } from './server-plugin-context'

export class ServerPluginRegistry {
  private plugins: Map<PluginId, ServerPlugin> = new Map()

  private pluginContexts: Map<PluginId, ServerPluginContext> = new Map()

  private commands: Map<string, (...args: any[]) => void> = new Map()

  providerManagers = createProviderManagers()

  private checkDependencies(plugin: ServerPlugin): boolean {
    return (
      !plugin.dependencies ||
      plugin.dependencies.every(depId => this.plugins.has(depId))
    )
  }

  async loadPlugin(_plugin: ServerPlugin): Promise<void> {
    let currentPluginId: PluginId | null = null

    try {
      const plugin = _plugin as ServerPlugin
      currentPluginId = plugin.id

      if (!this.checkDependencies(plugin))
        throw new Error(`Dependencies not met for plugin ${currentPluginId}`)

      this.plugins.set(currentPluginId, plugin)
      const context = new ServerPluginContext({
        registry: this,
        pluginId: currentPluginId
      })
      this.pluginContexts.set(currentPluginId, context)
      await plugin.activate(context)
    } catch (error: any) {
      this.handleError(error, currentPluginId)
    } finally {
      currentPluginId = null
    }
  }

  private handleError(error: Error, pluginId: PluginId | null): void {
    logger.error(`Error in plugin ${pluginId}:`, error)
  }

  registerCommand(command: string, callback: (...args: any[]) => void): void {
    this.commands.set(command, callback)
  }

  executeCommand(command: string, ...args: any[]): void {
    const callback = this.commands.get(command)
    if (callback) callback(...args)
  }

  getPlugin<T extends ServerPlugin>(pluginId: PluginId): T | undefined {
    return this.plugins.get(pluginId) as T
  }

  async unloadPlugin(pluginId: PluginId): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (plugin?.deactivate) {
      await plugin.deactivate()
    }
    this.plugins.delete(pluginId)
    Object.values(this.providerManagers).forEach(manager =>
      manager.unregister(pluginId)
    )
  }

  async unloadAllPlugins(): Promise<void> {
    for (const pluginId of this.plugins.keys()) {
      await this.unloadPlugin(pluginId)
    }
  }
}
