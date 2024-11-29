import React, { createContext, useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GlobalSearch } from '@webview/components/global-search/global-search'
import { useCallbackRef } from '@webview/hooks/use-callback-ref'
import { api } from '@webview/services/api-client'
import { noop } from 'es-toolkit'
import { useDebounce, useKey } from 'react-use'

import { searchSettings } from './search-settings'
import type { GlobalSearchContextType } from './types'
import { useSearchCategories } from './use-search-categories'

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
  const closeSearch = (reset = false) => {
    setIsOpen(false)
    if (reset) {
      setSearchQuery('')
      setActiveCategory('')
    }
  }

  const getIsOpen = useCallbackRef(() => isOpen)
  useKey(
    event => (event.metaKey || event.ctrlKey) && event.key === 'k',
    event => {
      event.preventDefault()
      if (getIsOpen()) {
        closeSearch()
      } else {
        openSearch()
      }
    },
    { event: 'keydown' }
  )

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['globalSearch', debouncedSearchQuery],
    queryFn: async ({ signal }) => {
      if (!debouncedSearchQuery) return []

      const chatSessions = await api.chatSession.searchSessions(
        {
          query: debouncedSearchQuery
        },
        noop,
        signal
      )
      const settingsResults = searchSettings(debouncedSearchQuery)

      return [
        ...chatSessions.map(session => ({
          type: 'chatSession' as const,
          item: session
        })),
        ...settingsResults
      ]
    },
    enabled: debouncedSearchQuery.length > 0 && isOpen
  })

  const searchCategories = useSearchCategories(searchResults)

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
      <GlobalSearch
        categoriesIsResult
        categories={searchCategories}
        open={isOpen}
        onOpenChange={setIsOpen}
        activeCategory={activeCategory}
        onActiveCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      {children}
    </GlobalSearchContext.Provider>
  )
}
