import React, { createContext, useContext, useState } from 'react'
import type { ChatSession } from '@extension/webview-api/lowdb/chat-sessions-db'
import { useQuery } from '@tanstack/react-query'
import { GlobalSearch } from '@webview/components/global-search/global-search'
import type { SettingItem } from '@webview/components/settings/settings'
import { settingsConfig } from '@webview/components/settings/settings-config'
import { api } from '@webview/services/api-client'
import { useDebounce, useKey } from 'react-use'

interface SearchResult {
  type: 'chatSession' | 'setting'
  item: ChatSession | SettingItem
}

interface GlobalSearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: SearchResult[]
  isSearching: boolean
  isOpen: boolean
  openSearch: () => void
  closeSearch: () => void
  activeCategory: string
  setActiveCategory: (category: string) => void
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(
  undefined
)

export const useGlobalSearch = () => {
  const context = useContext(GlobalSearchContext)
  if (!context) {
    throw new Error(
      'useGlobalSearch must be used within a GlobalSearchProvider'
    )
  }
  return context
}

export const GlobalSearchProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useDebounce(
    () => {
      setDebouncedSearchQuery(searchQuery)
    },
    300,
    [searchQuery]
  )

  const openSearch = () => setIsOpen(true)
  const closeSearch = () => {
    setIsOpen(false)
    setSearchQuery('')
    setActiveCategory('')
  }

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['globalSearch', debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery) return []

      const chatSessions = await api.chatSession.searchSessions({
        query: debouncedSearchQuery
      })
      const settingsResults = searchSettings(debouncedSearchQuery)

      return [
        ...chatSessions.map(session => ({
          type: 'chatSession' as const,
          item: session
        })),
        ...settingsResults.map(setting => ({
          type: 'setting' as const,
          item: setting
        }))
      ]
    },
    enabled: debouncedSearchQuery.length > 0 && isOpen
  })

  const contextValue = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    isOpen,
    openSearch,
    closeSearch,
    activeCategory,
    setActiveCategory
  }

  return (
    <GlobalSearchContext.Provider value={contextValue}>
      <GlobalSearchListener>
        <GlobalSearch
          categoriesIsResult
          categories={[
            {
              id: 'chatSessions',
              name: 'Chat History',
              items: searchResults
                .filter(result => result.type === 'chatSession')
                .map(result => {
                  const chatSession = result.item as ChatSession
                  return {
                    id: chatSession.id,
                    label: chatSession.title,
                    keywords: [chatSession.title],
                    onSelect: () => {
                      /* handle selection */
                    }
                  }
                })
            },
            {
              id: 'settings',
              name: 'Settings',
              items: searchResults
                .filter(result => result.type === 'setting')
                .map(result => ({
                  id: (result.item as SettingItem).key,
                  label: (result.item as SettingItem).label,
                  onSelect: () => {
                    /* handle selection */
                  }
                }))
            }
          ]}
          open={isOpen}
          onOpenChange={setIsOpen}
          activeCategory={activeCategory}
          onActiveCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
        {children}
      </GlobalSearchListener>
    </GlobalSearchContext.Provider>
  )
}

const searchSettings = (query: string): SettingItem[] => {
  const allSettings = settingsConfig.categories.flatMap(
    category => category.settings || []
  )
  return allSettings.filter(
    setting =>
      setting.label.toLowerCase().includes(query.toLowerCase()) ||
      setting.description.toLowerCase().includes(query.toLowerCase())
  )
}

const GlobalSearchListener: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const { openSearch } = useGlobalSearch()

  useKey(
    event => (event.metaKey || event.ctrlKey) && event.key === 'k',
    event => {
      event.preventDefault()
      openSearch()
    },
    { event: 'keydown' }
  )

  return <>{children}</>
}
