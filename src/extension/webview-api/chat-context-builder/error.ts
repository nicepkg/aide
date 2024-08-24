export class PluginError extends Error {
  constructor(pluginName: string, message: string) {
    super(`[${pluginName}] ${message}`)
    this.name = 'ChatContextBuilderPluginError'
  }
}

export class ChatContextBuilderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ChatContextBuilderError'
  }
}
