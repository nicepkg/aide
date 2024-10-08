import type { BaseContextInfo, BaseToolContext } from './base-context'

export interface WebSearchResult extends BaseContextInfo {
  url: string
  title: string
  content: string
}

export interface WebContext extends BaseToolContext {
  webSearchResults: WebSearchResult[]
}
