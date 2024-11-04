import { ConversationEntity } from '@shared/entities/conversation-entity'
import type { Conversation } from '@shared/types/chat-context'
import { useImmer } from 'use-immer'

export const useConversation = (
  role: Conversation['role'] = 'human',
  initConversation?: Conversation
) => {
  const [conversation, setConversation] = useImmer<Conversation>(
    () => initConversation ?? new ConversationEntity({ role }).entity
  )

  const resetConversation = () => {
    setConversation(new ConversationEntity({ role }).entity)
  }

  return {
    conversation,
    setConversation,
    resetConversation
  }
}
