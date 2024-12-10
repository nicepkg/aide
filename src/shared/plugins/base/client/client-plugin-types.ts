import type { FC } from 'react'
import type { BaseConversationLog, ConversationLog } from '@shared/entities'
import type { ImageInfo } from '@shared/plugins/fs-plugin/types'
import type { FileInfo, MentionOption } from '@webview/types/chat'

export type UseMentionOptionsReturns = MentionOption[]

export type UseSelectedFilesReturns = {
  selectedFiles: FileInfo[]
  setSelectedFiles: (files: FileInfo[]) => void
}

export type UseSelectedImagesReturns = {
  selectedImages: ImageInfo[]
  addSelectedImage: (image: ImageInfo) => void
  removeSelectedImage: (image: ImageInfo) => void
}

export type CustomRenderLogPreviewProps<
  T extends BaseConversationLog = ConversationLog
> = {
  log: T
}

export type ClientPluginProviderMap = {
  useMentionOptions: () => UseMentionOptionsReturns
  useSelectedFiles: () => UseSelectedFilesReturns
  useSelectedImages: () => UseSelectedImagesReturns
  CustomRenderLogPreview: FC<CustomRenderLogPreviewProps>
}
