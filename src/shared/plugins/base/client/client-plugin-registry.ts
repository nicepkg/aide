import type { QueryClient } from '@tanstack/react-query'
import { logger } from '@webview/utils/logger'
import type { DraftFunction, Updater } from 'use-immer'

import type { PluginId, PluginState } from '../types'
import { ClientPluginContext, type ClientPlugin } from './client-plugin-context'
import { createProviderManagers } from './create-provider-manager'

interface ClientPluginRegistryInitOptions {
  queryClient: QueryClient
  // getState: () => Record<PluginId, PluginState>
  state: Record<PluginId, PluginState>
  setState: Updater<Record<PluginId, PluginState>>
}

export class ClientPluginRegistry {
  private plugins: Map<PluginId, ClientPlugin> = new Map()

  private pluginContexts: Map<PluginId, ClientPluginContext> = new Map()

  private commands: Map<string, (...args: any[]) => void> = new Map()

  queryClient!: QueryClient

  providerManagers = createProviderManagers()

  isInitialized: boolean = false

  private state!: Record<PluginId, PluginState>

  getState!: <State extends PluginState>(pluginId: PluginId) => State

  setState!: <State extends PluginState>(
    pluginId: PluginId,
    updater: State | DraftFunction<State>
  ) => void

  init(options: ClientPluginRegistryInitOptions): void {
    this.queryClient = options.queryClient
    this.state = options.state

    this.getState = <State extends PluginState>(pluginId: PluginId) =>
      (this.state[pluginId] || {}) as State

    this.setState = (
      pluginId: PluginId,
      updater: PluginState | DraftFunction<PluginState>
    ) => {
      options.setState(draft => {
        if (!draft[pluginId]) {
          draft[pluginId] = {}
        }

        if (typeof updater === 'function') {
          updater(draft[pluginId])
        } else {
          draft[pluginId] = updater
        }
      })
    }
    this.isInitialized = true
  }

  private checkDependencies(plugin: ClientPlugin): boolean {
    return (
      !plugin.dependencies ||
      plugin.dependencies.every(depId => this.plugins.has(depId))
    )
  }

  private handleError(error: Error, pluginId: PluginId | null): void {
    logger.error(`Error in plugin ${pluginId}:`, error)
  }

  usePluginState<State extends PluginState>(pluginId: PluginId) {
    const state = this.getState<State>(pluginId)
    const setState = (updater: DraftFunction<State>) =>
      this.setState(pluginId, updater)

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
