import type { BaseToolContext } from './base-tool-context'

export interface DocInfo {
  content: string
  path: string // file path or url
}

export interface DocContext extends BaseToolContext {
  allowSearchDocSiteUrls: string[]
  relevantDocs: DocInfo[]
}
