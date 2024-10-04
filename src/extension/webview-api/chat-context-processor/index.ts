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
  private strategyMap: Map<ChatContextType, BaseStrategy>

  protected registerManager: RegisterManager

  protected commandManager: CommandManager

  constructor(
    registerManager: RegisterManager,
    commandManager: CommandManager
  ) {
    this.registerManager = registerManager
    this.commandManager = commandManager

    this.strategyMap = new Map([
      [ChatContextType.Chat, new ChatStrategy(registerManager, commandManager)],
      [
        ChatContextType.Composer,
        new ComposerStrategy(registerManager, commandManager)
      ],
      [ChatContextType.V0, new V0Strategy(registerManager, commandManager)],
      [
        ChatContextType.AutoTask,
        new AutoTaskStrategy(registerManager, commandManager)
      ]
    ])
  }

  private selectStrategy(context: ChatContext): BaseStrategy {
    return (
      this.strategyMap.get(context.type) ||
      this.strategyMap.get(ChatContextType.Chat)!
    )
  }

  async *getAnswers(
    context: ChatContext
  ): AsyncGenerator<Conversation[], void, unknown> {
    const strategy = this.selectStrategy(context)
    yield* strategy.getAnswers(context)
  }
}
