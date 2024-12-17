import type { Mention } from '@shared/entities'

import { PluginId } from '../base/types'

export enum DocMentionType {
  Docs = `${PluginId.Doc}#docs`,
  Doc = `${PluginId.Doc}#doc`,
  DocSetting = `${PluginId.Doc}#doc-setting`
}

export type DocMention = Mention<DocMentionType.Doc, string>

export interface DocInfo {
  content: string
  path: string // file path or url
}

export interface DocPluginState {}
