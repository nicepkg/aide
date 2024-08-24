import type { ChatContext } from '@extension/webview-api/chat-context-builder/types/chat-context'

import { BaseContextManager } from './managers/base.manager'
import { ConversationContextManager } from './managers/conversation.manager'
import { FileContextManager } from './managers/file.manager'
import { SettingsContextManager } from './managers/settings.manager'

type ContextPart = Partial<ChatContext>

export class ChatContextManager<
  T extends Record<string, BaseContextManager<ContextPart>>
> {
  private managers: T

  constructor(managers: T) {
    this.managers = managers
  }

  getContext(): ChatContext {
    return Object.values(this.managers).reduce(
      (acc, manager) => ({
        ...acc,
        ...manager.getContext()
      }),
      {} as ChatContext
    )
  }

  get<K extends keyof T>(managerKey: K): T[K] {
    return this.managers[managerKey]
  }
}

export const createChatContextManager = () => {
  const chatContextManager = new ChatContextManager({
    file: new FileContextManager(),
    conversation: new ConversationContextManager(),
    settings: new SettingsContextManager()
  })

  // chatContextManager.get('file').addFile({ name: 'file1' })

  return chatContextManager
}
