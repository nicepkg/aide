import { getErrorMsg } from '@extension/utils'

import { ChatContextBuilderError, PluginError } from './error'
import type { PluginManager } from './plugin-manager'
import type { ChatContext } from './types/chat-context'
import type { LangchainMessageType } from './types/langchain-message'

export class ChatContextBuilder {
  constructor(public pluginManager: PluginManager) {}

  async buildContext(
    context: Partial<ChatContext>
  ): Promise<LangchainMessageType[]> {
    try {
      let messages: LangchainMessageType[] = []

      for await (const plugin of this.pluginManager.getAllPlugins()) {
        messages = messages.concat(
          await plugin.buildContext(context, this.pluginManager)
        )
      }

      return messages
    } catch (error) {
      const errMsg = getErrorMsg(error)

      if (error instanceof PluginError) {
        throw error
      } else {
        // Handle general errors
        throw new ChatContextBuilderError(`Failed to build context: ${errMsg}`)
      }
    }
  }
}
