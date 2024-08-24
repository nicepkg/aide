import type { ChatContext } from '../types/chat-context'
import type { LangchainMessageType } from '../types/langchain-message'
import { BasePlugin } from './base.plugin'

export class CurrentFilePlugin extends BasePlugin {
  name = 'CurrentFile'

  async buildContext(
    // eslint-disable-next-line unused-imports/no-unused-vars
    context: Partial<ChatContext>
  ): Promise<LangchainMessageType[]> {
    return []
  }
}
