import type { QueryClient } from '@tanstack/react-query'
import { logger } from '@webview/utils/logger'
import { produce } from 'immer'

import type { PluginId, PluginState, ValidRecipeReturnType } from '../types'
import { ClientPluginContext, type ClientPlugin } from './client-plugin-context'
import { createProviderManagers } from './create-provider-manager'

interface ClientPluginRegistryOptions {
  queryClient: QueryClient
  getState: (pluginId: PluginId) => any
  setState: (pluginId: PluginId, newState: any) => void
}

export class ClientPluginRegistry {
  private plugins: Map<PluginId, ClientPlugin> = new Map()

  private pluginContexts: Map<PluginId, ClientPluginContext> = new Map()

  private commands: Map<string, (...args: any[]) => void> = new Map()

  queryClient: QueryClient

  providerManagers = createProviderManagers()

  getState: (pluginId: PluginId) => any

  setState: <State extends PluginState>(
    pluginId: PluginId,
    updater: State | ((draft: State) => ValidRecipeReturnType<State>)
  ) => void

  constructor(options: ClientPluginRegistryOptions) {
    this.queryClient = options.queryClient
    this.getState = options.getState
    this.setState = this.createStateSetter(options)
  }

  private createStateSetter(options: ClientPluginRegistryOptions) {
    return (
      pluginId: PluginId,
      updater:
        | PluginState
        | ((draft: PluginState) => ValidRecipeReturnType<PluginState>)
    ) => {
      const currentState = this.getState(pluginId)
      const newState =
        typeof updater === 'function' ? produce(currentState, updater) : updater
      options.setState(pluginId, newState)
    }
  }

  private checkDependencies(plugin: ClientPlugin): boolean {
    return (
      !plugin.dependencies ||
      plugin.dependencies.every(depId => this.plugins.has(depId))
    )
  }

  async loadPlugin<State extends PluginState>(
    _plugin: ClientPlugin<State>
  ): Promise<void> {
    let currentPluginId: PluginId | null = null

    try {
      const plugin = _plugin as ClientPlugin
      currentPluginId = plugin.id

      if (!this.checkDependencies(plugin))
        throw new Error(`Dependencies not met for plugin ${currentPluginId}`)

      this.plugins.set(currentPluginId, plugin)
      const context = new ClientPluginContext({
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

  usePluginState<State extends PluginState>(pluginId: PluginId) {
    const state = this.getState(pluginId) as State
    const setState = (
      updater: State | ((draft: State) => ValidRecipeReturnType<State>)
    ) => this.setState(pluginId, updater)

    const resetState = () => {
      const plugin = this.plugins.get(pluginId)
      if (plugin) this.setState(pluginId, plugin.getInitState())
    }

    return [state, setState, resetState] as const
  }

  registerCommand(command: string, callback: (...args: any[]) => void): void {
    this.commands.set(command, callback)
  }

  executeCommand(command: string, ...args: any[]): void {
    const callback = this.commands.get(command)
    if (callback) callback(...args)
  }

  getPlugin<T extends ClientPlugin>(pluginId: PluginId): T | undefined {
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
