import { getDefaultConversation } from '@shared/utils/get-default-conversation'
import type { Conversation } from '@webview/types/chat'
import { useImmer } from 'use-immer'

export const useConversation = (
  role: Conversation['role'] = 'human',
  initConversation?: Conversation
) => {
  const [conversation, setConversation] = useImmer<Conversation>(
    () => initConversation ?? getDefaultConversation(role)
  )

  const resetConversation = () => {
    setConversation(getDefaultConversation(role))
  }

  return {
    conversation,
    setConversation,
    resetConversation
  }
}
