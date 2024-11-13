import type { FC } from 'react'
import type { ConversationLog } from '@shared/entities'
import type { ImageInfo } from '@shared/plugins/fs-plugin/types'
import type { FileInfo, MentionOption } from '@webview/types/chat'

import { ProviderManager } from '../provider-manager'
import type { PluginState } from '../types'

export const createProviderManagers = () =>
  ({
    state: new ProviderManager<PluginState>(),
    editor: new ProviderManager<{
      getMentionOptions: () => Promise<MentionOption[]>
    }>(),
    filesSelector: new ProviderManager<{
      getSelectedFiles: () => FileInfo[]
      setSelectedFiles: (files: FileInfo[]) => void
    }>(),
    imagesSelector: new ProviderManager<{
      getSelectedImages: () => ImageInfo[]
      addSelectedImage: (image: ImageInfo) => void
      removeSelectedImage: (image: ImageInfo) => void
    }>(),
    message: new ProviderManager<{
      customRenderLogPreview: FC<{ log: ConversationLog }>
    }>()
  }) as const satisfies Record<string, ProviderManager<any>>
