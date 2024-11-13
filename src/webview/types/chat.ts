import type { FC } from 'react'
import type { Conversation } from '@shared/entities'
import type { MentionItemLayoutProps } from '@webview/components/chat/selectors/mention-selector/mention-item-layout'

export type { ProgressInfo } from '@extension/webview-api/chat-context-processor/utils/progress-reporter'
export type { FileInfo, FolderInfo } from '@extension/file-utils/traverse-fs'

export interface ModelOption {
  value: string
  label: string
}

export enum SearchSortStrategy {
  Default = 'Default',
  EndMatch = 'EndMatch'
}

export interface MentionOption<T = any> {
  id: string
  label: string
  type?: string
  onAddOne?: (data: T) => void
  onRemoveOne?: (data: T) => void
  onReplaceAll?: (dataArr: T[]) => void

  topLevelSort?: number
  searchKeywords?: string[]
  searchSortStrategy?: SearchSortStrategy
  children?: MentionOption[]
  data?: T
  itemLayoutProps?: MentionItemLayoutProps
  customRenderItem?: FC<MentionOption>
  customRenderPreview?: FC<MentionOption>
}

export interface ConversationUIState {
  isEditMode?: boolean
  isLoading?: boolean
  sendButtonDisabled?: boolean
}

export interface ConversationWithUIState extends Conversation {
  uiState: ConversationUIState
}
