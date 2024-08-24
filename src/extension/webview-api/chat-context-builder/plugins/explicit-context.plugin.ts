import { SystemMessage } from '@langchain/core/messages'

import type { ChatContext } from '../types/chat-context'
import type { LangchainMessageType } from '../types/langchain-message'
import { BasePlugin } from './base.plugin'

export class ExplicitContextPlugin extends BasePlugin {
  name = 'ExplicitContext'

  async buildContext(
    context: Partial<ChatContext>
  ): Promise<LangchainMessageType[]> {
    if (!context.explicitContext?.context) return []

    return [new SystemMessage(context.explicitContext.context)]
  }
}
