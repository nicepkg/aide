import type {
  Attachments,
  Conversation,
  IMentionStrategy
} from '@webview/types/chat'
import type { Updater } from 'use-immer'

export interface UseMentionManagerProps {
  newConversation: Conversation
  setNewConversation: Updater<Conversation>
}

export function useMentionManager(props: UseMentionManagerProps) {
  const { newConversation, setNewConversation } = props

  const currentAttachments = newConversation.attachments
  const updateCurrentAttachments = (attachments: Partial<Attachments>) => {
    setNewConversation(draft => {
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
    if (strategy) {
      const updatedAttachments =
        await strategy.buildNewAttachmentsAfterAddMention(
          strategyAddData,
          currentAttachments
        )
      updateCurrentAttachments(updatedAttachments)
    }
  }

  return {
    addMention
  }
}
