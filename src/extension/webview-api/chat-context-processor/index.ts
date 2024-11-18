import type { CommandManager } from '@extension/commands/command-manager'
import type { RegisterManager } from '@extension/registers/register-manager'
import {
  ChatContextType,
  type ChatContext,
  type Conversation
} from '@shared/entities'

import { AutoTaskStrategy } from './strategies/auto-task-strategy'
import type {
  BaseStrategy,
  BaseStrategyOptions
} from './strategies/base-strategy'
import { ChatStrategy } from './strategies/chat-strategy'
import { ComposerStrategy } from './strategies/composer-strategy'
import { UIDesignerStrategy } from './strategies/ui-designer-strategy'

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

    const baseStrategyOptions: BaseStrategyOptions = {
      registerManager,
      commandManager
    }

    this.strategyMap = new Map([
      [ChatContextType.Chat, new ChatStrategy(baseStrategyOptions)],
      [ChatContextType.Composer, new ComposerStrategy(baseStrategyOptions)],
      [ChatContextType.UIDesigner, new UIDesignerStrategy(baseStrategyOptions)],
      [ChatContextType.AutoTask, new AutoTaskStrategy(baseStrategyOptions)]
    ])
  }

  private selectStrategy(context: ChatContext): BaseStrategy {
    return (
      this.strategyMap.get(context.type) ||
      this.strategyMap.get(ChatContextType.Chat)!
    )
  }

  async *getAnswers(
    context: ChatContext,
    abortController?: AbortController
  ): AsyncGenerator<Conversation[], void, unknown> {
    const strategy = this.selectStrategy(context)
    yield* strategy.getAnswers(context, abortController)
  }
}
