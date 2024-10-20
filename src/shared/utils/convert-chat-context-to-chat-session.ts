import { type ChatContext } from '@shared/types/chat-context'
import type { ChatSession } from '@webview/types/chat'

import { getTitleFromConversations } from './get-title-from-conversations'

export const convertChatContextToChatSession = (
  chatContext: ChatContext
): ChatSession => ({
  id: chatContext.id,
  title: getTitleFromConversations(chatContext.conversations),
  type: chatContext.type,
  createdAt: chatContext.createdAt,
  updatedAt: chatContext.updatedAt
})
