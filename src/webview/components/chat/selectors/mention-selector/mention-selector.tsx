import React, { useEffect, useRef, useState } from 'react'
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
import { useFilteredMentionOptions } from '@webview/hooks/chat/use-filtered-mention-options'
import { useControllableState } from '@webview/hooks/use-controllable-state'
import { useKeyboardNavigation } from '@webview/hooks/use-keyboard-navigation'
import { IMentionStrategy, MentionOption } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { useEvent } from 'react-use'

export interface SelectedMentionStrategy {
  name: string
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
  const maxItemLength = mentionOptions.length > 8 ? mentionOptions.length : 8
  const [optionsStack, setOptionsStack] = useState<MentionOption[][]>([
    mentionOptions
  ])

  const [isOpen = false, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: false,
    onChange: onOpenChange
  })

  const currentOptions = optionsStack[optionsStack.length - 1] || []

  const { filteredOptions, isFlattened } = useFilteredMentionOptions({
    currentOptions,
    searchQuery,
    maxItemLength
  })

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

  useEffect(() => {
    if (!isOpen) {
      setOptionsStack([mentionOptions])
    }
  }, [isOpen, mentionOptions])

  const handleSelect = (option: MentionOption) => {
    if (isFlattened) {
      if (option.mentionStrategy) {
        onSelect({
          name: option.label,
          strategy: option.mentionStrategy,
          strategyAddData: option.data || { label: option.label }
        })
      }
      setIsOpen(false)
      return
    }

    // not flattened
    if (option.children) {
      setOptionsStack(prevStack => [...prevStack, option.children || []])
      onCloseWithoutSelect?.()
    } else {
      if (option.mentionStrategy) {
        onSelect({
          name: option.label,
          strategy: option.mentionStrategy,
          strategyAddData: option.data || { label: option.label }
        })
      }
      setIsOpen(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn(
          'min-w-[200px] max-w-[400px] w-screen p-0',
          !isOpen && 'hidden'
        )}
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
                  key={option.id}
                  defaultValue=""
                  value=""
                  onSelect={() => handleSelect(option)}
                  className={cn(
                    'px-1.5 py-1',
                    focusedIndex === index && 'bg-secondary'
                  )}
                  ref={el => {
                    if (itemRefs.current) {
                      itemRefs.current[index] = el
                    }
                  }}
                >
                  {option.customRender ? (
                    <option.customRender {...option} />
                  ) : (
                    option.label
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
