import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@webview/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@webview/components/ui/popover'
import { useControllableState } from '@webview/hooks/use-controllable-state'
import { useKeyboardNavigation } from '@webview/hooks/use-keyboard-navigation'
import { IMentionStrategy, MentionOption } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { useEvent } from 'react-use'

export interface SelectedMentionStrategy {
  strategy: IMentionStrategy
  strategyAddData: any
}

interface MentionSelectorProps {
  searchQuery?: string
  mentionOptions: MentionOption[]
  onSelect: (option: SelectedMentionStrategy) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCloseWithoutSelect?: () => void
  children: React.ReactNode
}

export const MentionSelector: React.FC<MentionSelectorProps> = ({
  searchQuery = '',
  mentionOptions,
  onSelect,
  open,
  onOpenChange,
  onCloseWithoutSelect,
  children
}) => {
  const commandRef = useRef<HTMLDivElement>(null)
  const [currentOptions, setCurrentOptions] =
    useState<MentionOption[]>(mentionOptions)

  const [isOpen = false, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: false,
    onChange: onOpenChange
  })

  useEffect(() => {
    if (!isOpen) {
      setCurrentOptions(mentionOptions)
    }
  }, [isOpen, mentionOptions])

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return currentOptions
    return currentOptions.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [currentOptions, searchQuery])

  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const { focusedIndex, setFocusedIndex, handleKeyDown } =
    useKeyboardNavigation({
      itemCount: filteredOptions.length,
      itemRefs,
      onEnter: el => el?.click()
    })

  useEvent('keydown', handleKeyDown)

  useEffect(() => {
    setFocusedIndex(0)
  }, [filteredOptions])

  const handleSelect = (option: MentionOption) => {
    if (option.children) {
      setCurrentOptions(option.children)
      onCloseWithoutSelect?.()
    } else {
      onSelect({
        strategy: option.mentionStrategies[0]!,
        strategyAddData: option.data || { label: option.label }
      })
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn('w-[200px] p-0', !isOpen && 'hidden')}
        updatePositionStrategy="always"
        side="top"
        align="start"
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}
        onKeyDown={e => e.stopPropagation()}
      >
        <Command ref={commandRef} shouldFilter={false}>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup
              className={cn(filteredOptions.length === 0 ? 'p-0' : 'p-1')}
            >
              {filteredOptions.map((option, index) => (
                <CommandItem
                  key={option.label}
                  defaultValue=""
                  value=""
                  onSelect={() => handleSelect(option)}
                  className={cn(
                    'px-1.5 py-1',
                    focusedIndex === index &&
                      'bg-primary text-primary-foreground'
                  )}
                  ref={el => {
                    if (itemRefs.current) {
                      itemRefs.current[index] = el
                    }
                  }}
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
