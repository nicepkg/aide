import type { ChatSession, SettingConfigItem } from '@shared/entities'

export type SearchSettingItem = SettingConfigItem & {
  pageLabel: string
  pageId: string
  groupLabel?: string
  groupId?: string
}

export interface SearchResult {
  type: 'chatSession' | 'setting'
  item: ChatSession | SearchSettingItem
}

export interface GlobalSearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: SearchResult[]
  isSearching: boolean
  isOpen: boolean
  openSearch: () => void
  closeSearch: (reset?: boolean) => void
  activeCategory: string
  setActiveCategory: (category: string) => void
}
