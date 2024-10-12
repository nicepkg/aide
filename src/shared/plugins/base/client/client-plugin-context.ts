import type { PluginId, PluginState, ValidRecipeReturnType } from '../types'
import type { ClientPluginRegistry } from './client-plugin-registry'

export interface ClientPlugin<State extends PluginState = PluginState> {
  id: PluginId
  version: string
  dependencies?: PluginId[]
  getInitState(): State
  activate(context: ClientPluginContext<State>): Promise<void>
  deactivate?(): void
  migrate?(oldState: any): State // TODO
}

interface ClientPluginContextOptions {
  pluginId: PluginId
  registry: ClientPluginRegistry
}

export class ClientPluginContext<State extends PluginState = PluginState> {
  private pluginId: PluginId

  private registry: ClientPluginRegistry

  constructor(options: ClientPluginContextOptions) {
    const { pluginId, registry } = options
    this.pluginId = pluginId
    this.registry = registry
  }

  get state(): Readonly<State> {
    return this.registry.getState(this.pluginId)
  }

  setState(
    updater: State | ((draft: State) => ValidRecipeReturnType<State>)
  ): void {
    this.registry.setState(this.pluginId, updater)
  }

  resetState(): void {
    const plugin = this.registry.getPlugin(this.pluginId)

    if (!plugin) return

    this.registry.setState(this.pluginId, plugin.getInitState())
  }

  getQueryClient() {
    return this.registry.queryClient
  }

  registerCommand(command: string, callback: (...args: any[]) => void): void {
    this.registry.registerCommand(command, callback)
  }

  executeCommand(command: string, ...args: any[]): void {
    this.registry.executeCommand(command, ...args)
  }

  registerProvider<K extends keyof ClientPluginRegistry['providerManagers']>(
    key: K,
    provider: Parameters<
      ClientPluginRegistry['providerManagers'][K]['register']
    >[1]
  ): void {
    this.registry.providerManagers[key].register(this.pluginId, provider as any)
  }
}
