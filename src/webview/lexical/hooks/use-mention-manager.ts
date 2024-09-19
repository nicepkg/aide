import { getDefaultConversationAttachments } from '@shared/utils/get-default-conversation-attachments'
import type {
  Attachments,
  Conversation,
  IMentionStrategy
} from '@webview/types/chat'
import type { Updater } from 'use-immer'

export interface UseMentionManagerProps {
  conversation: Conversation
  setConversation: Updater<Conversation>
}

export function useMentionManager(props: UseMentionManagerProps) {
  const { conversation, setConversation } = props

  const currentAttachments =
    conversation.attachments || getDefaultConversationAttachments()

  const updateCurrentAttachments = (attachments: Partial<Attachments>) => {
    setConversation(draft => {
      if (!draft.attachments) {
        draft.attachments = getDefaultConversationAttachments()
      }

      draft.attachments = {
        ...draft.attachments,
        ...attachments
      }
    })
  }

  const addMention = async ({
    strategy,
    strategyAddData
  }: {
    strategy: IMentionStrategy
    strategyAddData: any
  }) => {
    try {
      if (strategy) {
        const updatedAttachments =
          await strategy.buildNewAttachmentsAfterAddMention(
            strategyAddData,
            currentAttachments
          )
        updateCurrentAttachments(updatedAttachments)
      }
    } catch (error) {
      console.warn('Error adding mention:', error)
    }
  }

  return {
    addMention
  }
}
