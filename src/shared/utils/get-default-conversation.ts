import type { Conversation } from '@extension/webview-api/chat-context-processor/types/chat-context'
import { v4 as uuidv4 } from 'uuid'

import { getDefaultConversationAttachments } from './get-default-conversation-attachments'

export const getDefaultConversation = (
  role: Conversation['role']
): Conversation => ({
  id: uuidv4(),
  createdAt: Date.now(),
  role,
  contents: [],
  attachments: getDefaultConversationAttachments()
})
