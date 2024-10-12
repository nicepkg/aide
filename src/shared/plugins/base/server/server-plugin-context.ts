import type { PluginId, PluginState } from '../types'
import type { createProviderManagers } from './create-provider-manager'
import type { ServerPluginRegistry } from './server-plugin-registry'

export interface ServerPlugin<State extends PluginState = PluginState> {
  id: PluginId
  version: string
  dependencies?: PluginId[]
  activate(context: ServerPluginContext<State>): Promise<void>
  deactivate?(): void
}

interface ServerPluginContextOptions {
  pluginId: PluginId
  registry: ServerPluginRegistry
}

// eslint-disable-next-line unused-imports/no-unused-vars
export class ServerPluginContext<State extends PluginState = PluginState> {
  private pluginId: PluginId

  private registry: ServerPluginRegistry

  constructor(options: ServerPluginContextOptions) {
    const { pluginId, registry } = options
    this.pluginId = pluginId
    this.registry = registry
  }

  registerCommand(command: string, callback: (...args: any[]) => void): void {
    this.registry.registerCommand(command, callback)
  }

  executeCommand(command: string, ...args: any[]): void {
    this.registry.executeCommand(command, ...args)
  }

  registerProvider<K extends keyof ServerPluginRegistry['providerManagers']>(
    key: K,
    provider: Parameters<
      ReturnType<typeof createProviderManagers>[K]['register']
    >[1]
  ): void {
    this.registry.providerManagers[key].register(this.pluginId, provider as any)
  }
}
