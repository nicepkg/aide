import type {
  Attachments,
  Conversation,
  IMentionStrategy
} from '@webview/types/chat'

export interface UseMentionManagerProps {
  newConversation: Conversation
  setNewConversation: React.Dispatch<React.SetStateAction<Conversation>>
}

export function useMentionManager(props: UseMentionManagerProps) {
  const { newConversation, setNewConversation } = props

  const currentAttachments = newConversation.attachments
  const updateCurrentAttachments = (attachments: Partial<Attachments>) => {
    setNewConversation(preConversation => ({
      ...preConversation,
      attachments: {
        ...preConversation.attachments,
        ...attachments
      }
    }))
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