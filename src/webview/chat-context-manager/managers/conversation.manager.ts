import type { IConversationContext } from '@extension/webview-api/chat-context-builder/types/chat-context'
import type { Message } from '@extension/webview-api/chat-context-builder/types/chat-context/message'

import { BaseContextManager } from './base.manager'

export class ConversationContextManager extends BaseContextManager<IConversationContext> {
  constructor() {
    super({
      conversation: [],
      references: {
        selections: [],
        fileSelections: [],
        folderSelections: [],
        useWeb: false,
        useCodebase: false
      },
      codeSelections: [],
      plainText: ''
    })
  }

  addMessage(message: Message): void {
    if (!this.context.conversation) {
      this.context.conversation = []
    }
    this.context.conversation.push(message)
  }

  removeMessage(index: number): void {
    if (
      this.context.conversation &&
      index >= 0 &&
      index < this.context.conversation.length
    ) {
      this.context.conversation.splice(index, 1)
    }
  }

  getMessages(): Message[] {
    return this.context.conversation || []
  }

  clearConversation(): void {
    this.context.conversation = []
  }
}
