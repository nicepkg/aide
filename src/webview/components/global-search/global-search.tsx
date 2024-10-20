import React, { useEffect, useRef, useState } from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from '@webview/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@webview/components/ui/popover'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@webview/components/ui/tabs'
import { useControllableState } from '@webview/hooks/use-controllable-state'
import { useKeyboardNavigation } from '@webview/hooks/use-keyboard-navigation'
import { cn } from '@webview/utils/common'

import {
  KeyboardShortcutsInfo,
  type ShortcutInfo
} from '../keyboard-shortcuts-info'

interface SearchCategory {
  id: string
  name: string
  items: SearchItem[]
}

interface SearchItem {
  id: string
  label: string
  icon?: React.ReactNode
  keywords?: string[]
  onSelect: () => void
  renderPreview?: () => React.ReactNode
  renderItem?: () => React.ReactNode
}

interface GlobalSearchProps {
  categories: SearchCategory[]
  categoriesIsResult?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
  activeCategory?: string
  onActiveCategoryChange?: (category: string) => void
  searchQuery?: string
  onSearchQueryChange?: (query: string) => void
}

const keyboardShortcuts: ShortcutInfo[] = [
  { key: ['↑', '↓'], description: 'Navigate', weight: 10 },
  { key: '↵', description: 'Select', weight: 9 },
  { key: '⇥', description: 'Switch tab', weight: 8 },
  { key: 'esc', description: 'Close', weight: 7 }
]

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  categories,
  categoriesIsResult,
  onOpenChange,
  open: openProp,
  activeCategory: activeCategoryProp,
  onActiveCategoryChange,
  searchQuery: searchQueryProp,
  onSearchQueryChange
}) => {
  const [isOpen, setIsOpen] = useControllableState({
    prop: openProp,
    defaultProp: false,
    onChange: onOpenChange
  })

  const [activeCategory, setActiveCategory] = useControllableState({
    prop: activeCategoryProp,
    defaultProp: 'all',
    onChange: onActiveCategoryChange
  })

  const [searchQuery, setSearchQuery] = useControllableState({
    prop: searchQueryProp,
    defaultProp: '',
    onChange: onSearchQueryChange
  })

  const [filteredItems, setFilteredItems] = useState<SearchItem[]>([])

  const [focusedItem, setFocusedItem] = useState<SearchItem | null>(null)

  useEffect(() => {
    const items =
      activeCategory === 'all'
        ? categories.flatMap(c => c.items)
        : categories.find(c => c.id === activeCategory)?.items || []

    if (categoriesIsResult) {
      setFilteredItems(items)
    } else {
      setFilteredItems(
        items.filter(item => {
          const searchLower = searchQuery?.toLowerCase() || ''
          return (
            item.label.toLowerCase().includes(searchLower) ||
            item.keywords?.some(keyword =>
              keyword.toLowerCase().includes(searchLower)
            )
          )
        })
      )
    }
  }, [activeCategory, searchQuery, categories, categoriesIsResult])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearchQuery('')
    }
  }

  const finalCategories = [
    {
      id: 'all',
      name: 'All',
      items: categories.flatMap(c => c.items)
    },
    ...categories
  ]

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const { handleKeyDown, setFocusedIndex } = useKeyboardNavigation({
    itemCount: finalCategories.length,
    itemRefs: tabRefs,
    mode: 'tab',
    defaultStartIndex: finalCategories.findIndex(t => t.id === activeCategory),
    onTab: (_, index) => setActiveCategory(finalCategories[index]?.id ?? 'all')
  })

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="flex flex-col">
        <Command
          loop
          shouldFilter={!categoriesIsResult}
          onValueChange={val => {
            const target = filteredItems.find(item => item.id === val)
            target && setFocusedItem(target)
          }}
          onKeyDown={handleKeyDown}
        >
          <CommandInput
            placeholder="Type to search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <Tabs
            className="h-[300px] overflow-auto"
            value={activeCategory}
            onValueChange={val => {
              setActiveCategory(val)
              setFocusedIndex(finalCategories.findIndex(t => t.id === val))
            }}
          >
            <TabsList mode="underlined">
              {finalCategories.map(category => (
                <TabsTrigger
                  mode="underlined"
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {finalCategories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <SearchResultList filteredItems={filteredItems} />
              </TabsContent>
            ))}
          </Tabs>
        </Command>
        <KeyboardShortcutsInfo shortcuts={keyboardShortcuts} />

        <Popover open={isOpen && Boolean(focusedItem?.renderPreview)}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={32}
            className="min-w-[200px] max-w-[400px] w-screen p-0 z-10"
            onOpenAutoFocus={e => e.preventDefault()}
            onCloseAutoFocus={e => e.preventDefault()}
            onKeyDown={e => e.stopPropagation()}
          >
            {focusedItem?.renderPreview?.()}
          </PopoverContent>
        </Popover>
      </div>
    </CommandDialog>
  )
}

const SearchResultList: React.FC<{
  filteredItems: SearchItem[]
}> = ({ filteredItems }) => (
  <CommandList className="py-2">
    {!filteredItems?.length ? (
      <CommandEmpty>No results found.</CommandEmpty>
    ) : (
      filteredItems.map(item => (
        <CommandItem
          key={item.id}
          className={cn(
            'm-2 rounded-md cursor-pointer data-[selected=true]:bg-secondary data-[selected=true]:text-foreground'
          )}
          defaultValue={item.id}
          value={item.id}
          keywords={item.keywords}
          onSelect={item.onSelect}
        >
          {item.renderItem ? (
            item.renderItem()
          ) : (
            <div className="flex items-center">
              {item.icon && <span className="mr-2">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
          )}
        </CommandItem>
      ))
    )}
  </CommandList>
)
