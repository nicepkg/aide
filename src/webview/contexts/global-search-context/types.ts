import type { ChatSession } from '@shared/entities'
import type { SettingItem } from '@webview/components/settings/types'

export interface SearchResult {
  type: 'chatSession' | 'setting'
  item: ChatSession | SettingItem
  metadata?: {
    groupName?: string
    categoryName: string
    categoryId: string
  }
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
