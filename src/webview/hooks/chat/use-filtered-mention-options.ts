import { useEffect, useMemo, useRef, useState } from 'react'
import { MentionOption, SearchSortStrategy } from '@webview/types/chat'
import Index from 'flexsearch/dist/module'

const flattenCurrentLevelOptions = (
  options: MentionOption[]
): MentionOption[] =>
  options.reduce((acc: MentionOption[], option) => {
    if (option.children) {
      return [...acc, ...option.children]
    }
    return [...acc, option]
  }, [])

export interface UseFilteredMentionOptions {
  currentOptions: MentionOption[]
  searchQuery: string
  maxItemLength: number
}

export const useFilteredMentionOptions = (props: UseFilteredMentionOptions) => {
  const { currentOptions, searchQuery, maxItemLength } = props
  const [isFlattened, setIsFlattened] = useState(false)
  const currentOptionsSearchServiceRef = useRef<SearchService>(
    new SearchService()
  )
  const flattenedOptionsSearchServiceRef = useRef<SearchService>(
    new SearchService()
  )

  useEffect(() => {
    currentOptionsSearchServiceRef.current.indexOptions(currentOptions)
  }, [currentOptions])

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return currentOptions.slice(0, maxItemLength)

    let matches = currentOptionsSearchServiceRef.current.search(searchQuery)

    if (matches.length > 0) {
      setIsFlattened(false)
      return matches.slice(0, maxItemLength)
    }

    // If no matches, try flattened options
    const flattenedOptions = flattenCurrentLevelOptions(currentOptions)
    flattenedOptionsSearchServiceRef.current.indexOptions(flattenedOptions)
    matches = flattenedOptionsSearchServiceRef.current.search(searchQuery)

    if (matches.length > 0) {
      setIsFlattened(true)
      return matches.slice(0, maxItemLength)
    }

    setIsFlattened(false)
    return []
  }, [searchQuery, currentOptions, maxItemLength])

  return { filteredOptions, isFlattened }
}

class SearchService {
  private index!: Index

  private optionsMap: Map<string, MentionOption> = new Map()

  constructor() {
    this.init()
  }

  init() {
    this.index = new Index({
      tokenize: 'full',
      cache: true,
      optimize: true,
      // 中文 https://github.com/nextapps-de/flexsearch?tab=readme-ov-file#cjk-word-break-chinese-japanese-korean
      // 同时支持中文和英文搜索 https://github.com/nextapps-de/flexsearch/issues/202
      encode(str: string) {
        // eslint-disable-next-line no-control-regex
        const cjkItems = str.replace(/[\x00-\x7F]/g, '').split('')
        const asciiItems = str.split(/\W+/)
        return cjkItems.concat(asciiItems)
      }
    })
    this.optionsMap.clear()
  }

  indexOptions(options: MentionOption[]) {
    this.init()
    options.forEach(option => {
      const { id } = option // Use a unique identifier, preferably option.id if available
      this.optionsMap.set(id, option)
      this.index.add(id, option.label)
      option.searchKeywords?.forEach(keyword => {
        this.index.add(id, keyword)
      })
    })
  }

  search(query: string): MentionOption[] {
    const results = this.index.search(query) as string[]
    const matchedOptions = results
      .map(id => this.optionsMap.get(id))
      .filter(Boolean) as MentionOption[]

    return this.sortOptionsByStrategy(query, matchedOptions)
  }

  private sortOptionsByStrategy(
    query: string,
    options: MentionOption[]
  ): MentionOption[] {
    return options.sort((a, b) => {
      const scoreA = this.getMatchScore(query, a)
      const scoreB = this.getMatchScore(query, b)

      // Higher scores come first
      return scoreB - scoreA
    })
  }

  private getMatchScore(query: string, option: MentionOption): number {
    const label = option.label.toLowerCase()
    const q = query.toLowerCase()

    // Exact match gets the highest score
    if (label === q) return 1000

    // Prefix match is second best
    if (label.startsWith(q)) return 500 + q.length / label.length

    // EndMatch strategy
    if (option.searchSortStrategy === SearchSortStrategy.EndMatch) {
      // Calculate the longest matching length from the end
      let matchLength = 0
      for (let i = 1; i <= Math.min(label.length, q.length); i++) {
        if (label.slice(-i) === q.slice(-i)) {
          matchLength = i
        } else {
          break
        }
      }

      // If the query is a suffix of the label, give a higher score
      if (matchLength === q.length) {
        return 200 + matchLength
      }

      // Partial end match
      return matchLength
    }

    // Contains match
    if (label.includes(q)) return 50

    // No match
    return 0
  }
}
