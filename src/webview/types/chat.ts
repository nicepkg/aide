import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import type { MessageType } from '@langchain/core/messages'

export interface IConversation {
  id: string
  type: MessageType
  content: string
  attachments: Attachments
}

export interface IChatContext {
  conversations: IConversation[]
  currentAttachments: Attachments
  addConversation: (conversation: IConversation) => void
  updateCurrentAttachments: (newAttachments: Partial<Attachments>) => void
  resetChat: () => void
}

export interface IMentionStrategy {
  type: string
  getData: () => Promise<any>
  updateAttachments: (
    data: any,
    currentAttachments: Attachments
  ) => Partial<Attachments>
}
