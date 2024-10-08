import type { FC } from 'react'
import type {
  Attachments,
  Conversation
} from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { MentionItemLayoutProps } from '@webview/components/chat/selectors/mention-selector/mention-item-layout'

export type { DocSite } from '@extension/webview-api/lowdb/doc-sites-db'

export type { ProgressInfo } from '@extension/webview-api/chat-context-processor/utils/process-reporter'
export * from '@extension/webview-api/chat-context-processor/types/chat-context'

export interface ModelOption {
  value: string
  label: string
}

export enum SearchSortStrategy {
  Default = 'Default',
  EndMatch = 'EndMatch'
}

export interface MentionOption {
  id: string
  label: string
  type?: AttachmentType
  searchKeywords?: string[]
  searchSortStrategy?: SearchSortStrategy
  children?: MentionOption[]
  data?: any
  itemLayoutProps?: MentionItemLayoutProps
  customRenderItem?: FC<MentionOption>
  customRenderPreview?: FC<MentionOption>
}

export enum AttachmentType {
  Files = 'Files',
  Folders = 'Folders',
  Images = 'Images',
  Code = 'Code',
  Web = 'Web',
  Docs = 'Docs',
  GitDiff = 'GitDiff',
  GitCommit = 'GitCommit',
  GitPr = 'GitPr',
  Codebase = 'Codebase'
}

export type AttachmentItem = {
  type: AttachmentType
  data: any
}

export interface IMentionStrategy {
  readonly category: AttachmentType
  readonly name: string

  buildLexicalNodeAfterAddMention?: (
    data: any,
    currentAttachments: Attachments,
    currentConversation: Conversation
  ) => Promise<string>

  buildNewAttachmentsAfterAddMention: (
    data: any,
    currentAttachments: Attachments
  ) => Promise<Partial<Attachments>>
}

export interface ConversationUIState {
  isEditMode?: boolean
  isLoading?: boolean
  sendButtonDisabled?: boolean
}

export interface ConversationWithUIState extends Conversation {
  uiState: ConversationUIState
}
