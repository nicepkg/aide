export interface DocInfo {
  content: string
  path: string // file path or url
}

export interface DocPluginState {
  allowSearchDocSiteNamesFromEditor: string[]
  relevantDocsFromAgent: DocInfo[]
}
