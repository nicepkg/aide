import type { CommandManager } from '@extension/commands/command-manager'
import type { RegisterManager } from '@extension/registers/register-manager'
import type { ChatContext, Conversation } from '@shared/entities'

export interface BaseStrategyOptions {
  registerManager: RegisterManager
  commandManager: CommandManager
}

export abstract class BaseStrategy {
  protected registerManager: RegisterManager

  protected commandManager: CommandManager

  constructor(options: BaseStrategyOptions) {
    this.registerManager = options.registerManager
    this.commandManager = options.commandManager
  }

  abstract getAnswers(
    chatContext: ChatContext,
    abortController?: AbortController
  ): AsyncGenerator<Conversation[], void, unknown>
}
