import type { IterableReadableStream } from '@langchain/core/dist/utils/stream'

import { AutoTaskStrategy } from './strategies/auto-task-strategy'
import type { BaseStrategy } from './strategies/base-strategy'
import { ChatStrategy } from './strategies/chat-strategy'
import { ComposerStrategy } from './strategies/composer-strategy'
import { V0Strategy } from './strategies/v0-strategy'
import { ChatContextType, type ChatContext } from './types/chat-context'
import type { LangchainMessage } from './types/langchain-message'

export class ChatContextProcessor {
  private strategies: Map<ChatContextType, BaseStrategy>

  constructor() {
    this.strategies = new Map()
    this.strategies.set(ChatContextType.Chat, new ChatStrategy())
    this.strategies.set(ChatContextType.Composer, new ComposerStrategy())
    this.strategies.set(ChatContextType.V0, new V0Strategy())
    this.strategies.set(ChatContextType.AutoTask, new AutoTaskStrategy())
  }

  getCurrentStrategy(context: ChatContext): BaseStrategy {
    const strategy =
      this.strategies.get(context.type) ||
      this.strategies.get(ChatContextType.Chat)

    return strategy!
  }

  async getAnswers(
    context: ChatContext
  ): Promise<IterableReadableStream<LangchainMessage>> {
    const strategy = this.getCurrentStrategy(context)
    return strategy.getAnswers(context)
  }
}
