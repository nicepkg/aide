import type { Conversation } from '@shared/types/chat-context'
import { v4 as uuidv4 } from 'uuid'

export const getDefaultConversation = (
  role: Conversation['role']
): Conversation => ({
  id: uuidv4(),
  createdAt: Date.now(),
  role,
  contents: [],
  pluginStates: {}
})
