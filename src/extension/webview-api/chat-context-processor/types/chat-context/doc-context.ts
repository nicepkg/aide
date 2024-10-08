import type { BaseContextInfo } from './base-context'

export interface DocInfo extends BaseContextInfo {
  content: string
  path: string // file path or url
}

export interface DocSiteName extends BaseContextInfo {
  name: string
}

export interface DocContext {
  allowSearchDocSiteNames: DocSiteName[]
  relevantDocs: DocInfo[]
}
