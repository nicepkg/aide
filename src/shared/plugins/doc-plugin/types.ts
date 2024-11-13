import type { BaseConversationLog } from '@shared/entities'

import type { PluginId } from '../base/types'

export interface DocInfo {
  content: string
  path: string // file path or url
}

export interface DocPluginState {
  allowSearchDocSiteNamesFromEditor: string[]
  relevantDocsFromAgent: DocInfo[]
}

export interface DocPluginLog extends BaseConversationLog {
  pluginId: PluginId.Doc
  relevantDocsFromAgent?: DocInfo[]
}
