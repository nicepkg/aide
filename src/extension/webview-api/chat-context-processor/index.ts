import type { CommandManager } from '@extension/commands/command-manager'
import type { RegisterManager } from '@extension/registers/register-manager'

import { AutoTaskStrategy } from './strategies/auto-task-strategy'
import type { BaseStrategy } from './strategies/base-strategy'
import { ChatStrategy } from './strategies/chat-strategy'
import { ComposerStrategy } from './strategies/composer-strategy'
import { V0Strategy } from './strategies/v0-strategy'
import {
  ChatContextType,
  type ChatContext,
  type Conversation
} from './types/chat-context'

export class ChatContextProcessor {
  private strategies: Map<ChatContextType, BaseStrategy>

  protected registerManager: RegisterManager

  protected commandManager: CommandManager

  constructor(
    registerManager: RegisterManager,
    commandManager: CommandManager
  ) {
    this.registerManager = registerManager
    this.commandManager = commandManager

    this.strategies = new Map()
    this.strategies.set(
      ChatContextType.Chat,
      new ChatStrategy(registerManager, commandManager)
    )
    this.strategies.set(
      ChatContextType.Composer,
      new ComposerStrategy(registerManager, commandManager)
    )
    this.strategies.set(
      ChatContextType.V0,
      new V0Strategy(registerManager, commandManager)
    )
    this.strategies.set(
      ChatContextType.AutoTask,
      new AutoTaskStrategy(registerManager, commandManager)
    )
  }

  private getCurrentStrategy(context: ChatContext): BaseStrategy {
    const strategy =
      this.strategies.get(context.type) ||
      this.strategies.get(ChatContextType.Chat)

    return strategy!
  }

  getAnswers(
    context: ChatContext
  ): AsyncGenerator<Conversation[], void, unknown> {
    const strategy = this.getCurrentStrategy(context)
    return strategy.getAnswers(context)
  }
}
