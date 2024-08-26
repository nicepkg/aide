export interface WebSearchResult {
  url: string
  title: string
  snippet: string
}

export interface WebContext {
  searchResults: WebSearchResult[]
}
