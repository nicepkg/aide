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

  constructor() {
    this.strategies = new Map()
    this.strategies.set(ChatContextType.Chat, new ChatStrategy())
    this.strategies.set(ChatContextType.Composer, new ComposerStrategy())
    this.strategies.set(ChatContextType.V0, new V0Strategy())
    this.strategies.set(ChatContextType.AutoTask, new AutoTaskStrategy())
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
