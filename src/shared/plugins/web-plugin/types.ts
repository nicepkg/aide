import type { BaseConversationLog } from '@shared/entities'

import type { PluginId } from '../base/types'

export interface WebDocInfo {
  content: string
  url: string
}

export interface WebPluginState {
  enableWebSearchAgent: boolean
  webSearchResultsFromAgent: WebDocInfo[]
  webSearchAsDocFromAgent: WebDocInfo[]
  enableWebVisitAgent: boolean
  webVisitResultsFromAgent: WebDocInfo[]
}

export interface WebPluginLog extends BaseConversationLog {
  pluginId: PluginId.Web
  webSearchResultsFromAgent?: WebDocInfo[]
  webVisitResultsFromAgent?: WebDocInfo[]
}
