import type { BasePlugin } from './plugins/base.plugin'

export class PluginManager {
  private plugins: Map<string, BasePlugin> = new Map()

  async registerPlugin(plugin: BasePlugin): Promise<void> {
    await plugin.initialize()
    this.plugins.set(plugin.name, plugin)
  }

  getPlugin(name: string): BasePlugin | undefined {
    return this.plugins.get(name)
  }

  getAllPlugins(): BasePlugin[] {
    return Array.from(this.plugins.values())
  }

  async cleanupPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name)
    if (plugin) {
      await plugin.cleanup()
      this.plugins.delete(name)
    }
  }

  async cleanupAllPlugins(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.cleanup()
    }
    this.plugins.clear()
  }
}
