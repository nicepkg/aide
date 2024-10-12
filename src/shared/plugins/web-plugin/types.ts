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
