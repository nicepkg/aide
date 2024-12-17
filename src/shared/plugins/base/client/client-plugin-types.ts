import type { FC } from 'react'
import type { MentionOption } from '@webview/types/chat'

import type { LogWithAgent } from '../base-to-state'

export type UseMentionOptionsReturns = MentionOption[]

export type CustomRenderLogPreviewProps = {
  log: LogWithAgent
}

export type ClientPluginProviderMap = {
  useMentionOptions: () => UseMentionOptionsReturns
  CustomRenderLogPreview: FC<CustomRenderLogPreviewProps>
}
