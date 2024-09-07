import { useCallback, useEffect, useRef, type FC, type ReactNode } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@webview/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@webview/components/ui/popover'
import { useCallbackRef } from '@webview/hooks/use-callback-ref'
import { useControllableState } from '@webview/hooks/use-controllable-state'
import type { IMentionStrategy, MentionOption } from '@webview/types/chat'

export interface SelectedMentionStrategy {
  strategy: IMentionStrategy
  strategyAddData: any
}

interface MentionSelectorProps {
  mentionOptions: MentionOption[]
  onSelect: (option: SelectedMentionStrategy) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  lexicalMode?: boolean
  searchQuery?: string
  onSearchQueryChange?: (searchQuery: string) => void
  children: ReactNode
}

export const MentionSelector: FC<MentionSelectorProps> = ({
  mentionOptions,
  onSelect,
  open,
  onOpenChange,
  lexicalMode,
  searchQuery,
  onSearchQueryChange,
  children
}) => {
  const commandRef = useRef<HTMLDivElement>(null)

  const [isOpen = false, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: false,
    onChange: onOpenChange
  })

  const [internalSearchQuery, setInternalSearchQuery] = useControllableState({
    prop: searchQuery,
    defaultProp: '',
    onChange: onSearchQueryChange
  })

  useEffect(() => {
    if (!lexicalMode || mentionOptions.length > 0) return

    setIsOpen(false)
  }, [mentionOptions.length, setIsOpen, lexicalMode])

  const handleSelect = useCallback(
    (currentValue: string) => {
      const selectedOption = mentionOptions.find(
        option => option.category === currentValue
      )
      if (selectedOption) {
        onSelect({
          strategy: selectedOption.mentionStrategies[0]!,
          strategyAddData: { label: selectedOption.label }
        })
      }
      setIsOpen(false)
    },
    [mentionOptions, onSelect]
  )

  const filterMentions = useCallback(
    (value: string, search: string) => {
      const option = mentionOptions.find(opt => opt.category === value)
      if (!option) return 0

      const label = option.label.toLowerCase()
      search = search.toLowerCase()

      if (label === search) return 1
      if (label.startsWith(search)) return 0.8
      if (label.includes(search)) return 0.6

      // Calculate a basic fuzzy match score
      let score = 0
      let searchIndex = 0
      for (let i = 0; i < label.length && searchIndex < search.length; i++) {
        if (label[i] === search[searchIndex]) {
          score += 1
          searchIndex++
        }
      }
      return score / Math.max(label.length, search.length)
    },
    [mentionOptions]
  )

  const handleKeyDown = useCallbackRef((event: KeyboardEvent) => {
    if (!lexicalMode || !isOpen) return

    const commandEl = commandRef.current
    if (!commandEl) return

    if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
      event.preventDefault()

      const syntheticEvent = new KeyboardEvent(event.type, {
        key: event.key,
        code: event.code,
        isComposing: event.isComposing,
        location: event.location,
        repeat: event.repeat,
        bubbles: true
      })
      commandEl.dispatchEvent(syntheticEvent)
    }
  })

  useEffect(() => {
    if (!lexicalMode) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [lexicalMode, handleKeyDown, isOpen])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        updatePositionStrategy="always"
        side="top"
        onOpenAutoFocus={e => lexicalMode && e.preventDefault()}
        onCloseAutoFocus={e => lexicalMode && e.preventDefault()}
        onKeyDown={e => e.stopPropagation()}
      >
        <Command ref={commandRef} filter={filterMentions}>
          <CommandInput
            hidden={lexicalMode}
            showSearchIcon={false}
            placeholder="Search mention..."
            className="h-9"
            value={internalSearchQuery}
            onValueChange={setInternalSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No mention type found.</CommandEmpty>
            <CommandGroup>
              {mentionOptions.map(option => (
                <CommandItem
                  key={option.category}
                  value={option.category}
                  onSelect={handleSelect}
                  className="px-1.5 py-1"
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
