export interface DocInfo {
  content: string
  path: string // file path or url
}

export interface DocContext {
  allowSearchDocSiteNames: string[]
  relevantDocs: DocInfo[]
}
