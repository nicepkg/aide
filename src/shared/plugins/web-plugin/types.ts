import type { Mention } from '@shared/entities'

import { PluginId } from '../base/types'

export enum WebMentionType {
  Web = `${PluginId.Web}#web`
}

export type WebMention = Mention<WebMentionType.Web, boolean>

export interface WebDocInfo {
  content: string
  url: string
}

export interface WebPluginState {}
