import type { CommandManager } from '@extension/commands/command-manager'
import type { RegisterManager } from '@extension/registers/register-manager'
import { ServerPluginRegister } from '@extension/registers/server-plugin-register'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { ChatContext } from '@shared/types/chat-context'
import type { LangchainMessage } from '@shared/types/chat-context/langchain-message'
import { settledPromiseResults } from '@shared/utils/common'

import type { BaseStrategyOptions } from '../../base-strategy'
import { ConversationMessageConstructor } from './conversation-message-constructor'

interface ChatMessagesConstructorOptions extends BaseStrategyOptions {
  chatContext: ChatContext
}

export class ChatMessagesConstructor {
  private chatContext: ChatContext

  private registerManager: RegisterManager

  private commandManager: CommandManager

  private getChatStrategyProvider() {
    return this.registerManager
      .getRegister(ServerPluginRegister)
      ?.serverPluginRegistry?.providerManagers.chatStrategy.mergeAll()
  }

  constructor(options: ChatMessagesConstructorOptions) {
    this.chatContext = options.chatContext
    this.registerManager = options.registerManager
    this.commandManager = options.commandManager
  }

  async constructMessages(): Promise<LangchainMessage[]> {
    const systemMessage = await this.createSystemMessage()
    const instructionMessage = this.createCustomInstructionMessage()
    const conversationMessages = await this.buildConversationMessages()

    return [systemMessage, instructionMessage, ...conversationMessages].filter(
      Boolean
    ) as LangchainMessage[]
  }

  private async createSystemMessage(): Promise<SystemMessage | null> {
    const chatStrategyProvider = this.getChatStrategyProvider()
    const content = await chatStrategyProvider?.buildSystemMessagePrompt?.(
      this.chatContext
    )

    return content ? new SystemMessage({ content }) : null
  }

  private createCustomInstructionMessage(): HumanMessage | null {
    const { explicitContext } = this.chatContext.settings
    if (!explicitContext) return null

    return new HumanMessage({
      content: `
Please also follow these instructions in all of your responses if relevant to my query. No need to acknowledge these instructions directly in your response.
<custom_instructions>
${explicitContext}
</custom_instructions>
      `
    })
  }

  private async buildConversationMessages(): Promise<LangchainMessage[]> {
    const chatStrategyProvider = this.getChatStrategyProvider()

    if (!chatStrategyProvider)
      throw new Error('Chat strategy provider not found')

    const messagePromises = this.chatContext.conversations.map(conversation =>
      new ConversationMessageConstructor({
        chatContext: this.chatContext,
        conversation,
        chatStrategyProvider
      }).buildMessages()
    )
    const messageArrays = await settledPromiseResults(messagePromises)
    return messageArrays.flat()
  }
}
