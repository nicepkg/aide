import { getErrorMsg } from '@extension/utils'

import { PluginError } from '../error'
import type { PluginManager } from '../plugin-manager'
import type { ChatContext } from '../types/chat-context'
import type { LangchainMessageType } from '../types/langchain-message'

export abstract class BasePlugin {
  abstract name: string

  async initialize(): Promise<void> {
    // Default implementation
  }

  abstract buildContext(
    context: Partial<ChatContext>,
    pluginManager: PluginManager
  ): Promise<LangchainMessageType[]>

  protected createError(error: unknown): Error {
    const errMsg = getErrorMsg(error)
    return new PluginError(this.name, errMsg)
  }

  async cleanup(): Promise<void> {
    // Default implementation
  }
}
