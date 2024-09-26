import type { CommandManager } from '@extension/commands/command-manager'
import type { RegisterManager } from '@extension/registers/register-manager'

import type { ChatContext, Conversation } from '../types/chat-context'

export abstract class BaseStrategy {
  protected registerManager: RegisterManager

  protected commandManager: CommandManager

  constructor(
    registerManager: RegisterManager,
    commandManager: CommandManager
  ) {
    this.registerManager = registerManager
    this.commandManager = commandManager
  }

  abstract getAnswers(
    chatContext: ChatContext
  ): AsyncGenerator<Conversation[], void, unknown>
}
