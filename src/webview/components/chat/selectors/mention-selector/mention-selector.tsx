/* eslint-disable react-compiler/react-compiler */
import React, { useEffect, useRef, useState } from 'react'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { useQueryClient } from '@tanstack/react-query'
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
import { MentionOption } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { useEvent } from 'react-use'

import { MentionItemLayout } from './mention-item-layout'

interface MentionSelectorProps {
  searchQuery?: string
  mentionOptions: MentionOption[]
  onSelect: (option: MentionOption) => void
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

  const currentOptions = optionsStack.at(-1) || []

  const { filteredOptions, isFlattened, setIsFlattened } =
    useFilteredMentionOptions({
      currentOptions,
      searchQuery,
      maxItemLength
    })

  const [focusedOptionId, setFocusedOptionId] = useState<string | null>(null)
  const focusedOption = filteredOptions.find(
    option => option.id === focusedOptionId
  )

  useEffect(() => {
    setFocusedOptionId(filteredOptions?.[0]?.id || null)
  }, [filteredOptions])

  useEffect(() => {
    if (!isOpen) {
      setOptionsStack([mentionOptions])
      setFocusedOptionId(filteredOptions?.[0]?.id || null)
    }
  }, [isOpen, mentionOptions])

  const queryClient = useQueryClient()
  useEffect(() => {
    if (!isOpen) return
    queryClient.invalidateQueries({
      queryKey: ['realtime']
    })
  }, [isOpen, queryClient])

  const handleSelect = (option: MentionOption) => {
    if (isFlattened) {
      if (option.data) {
        onSelect(option)
      }
      setIsFlattened(false)
      setIsOpen(false)
      return
    }

    // not flattened
    if (option.children) {
      setOptionsStack(prevStack => [...prevStack, option.children || []])
      onCloseWithoutSelect?.()
    } else {
      if (option.data) {
        onSelect(option)
      }
      setIsOpen(false)
    }
  }

  useEvent('keydown', e => {
    if (isOpen && commandRef.current) {
      const event = new KeyboardEvent('keydown', {
        key: e.key,
        code: e.code,
        which: e.which,
        keyCode: e.keyCode,
        bubbles: true,
        cancelable: true
      })
      commandRef.current.dispatchEvent(event)
    }
  })

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn(
          'min-w-[200px] max-w-[400px] w-screen p-0 bg-transparent shadow-none border-none [&[data-side="bottom"]>div]:flex-col-reverse',
          !isOpen && 'hidden'
        )}
        innerClassName="flex flex-col gap-4 overflow-hidden"
        updatePositionStrategy="always"
        side="top"
        align="start"
        animate={false}
        onOpenAutoFocus={e => e.preventDefault()}
        onCloseAutoFocus={e => e.preventDefault()}
        onKeyDown={e => e.stopPropagation()}
      >
        <div
          className={cn(
            'w-full max-h-[50vh] flex overflow-y-auto overflow-x-hidden rounded-md shadow-md border-primary border bg-popover text-popover-foreground outline-none',
            isOpen && Boolean(focusedOption?.customRenderPreview)
              ? 'block'
              : 'hidden'
          )}
        >
          {focusedOption?.customRenderPreview && (
            <focusedOption.customRenderPreview {...focusedOption} />
          )}
        </div>

        <div className="w-full rounded-md shadow-md border bg-popover text-popover-foreground outline-none">
          <Command
            loop
            ref={commandRef}
            shouldFilter={false}
            value={focusedOptionId ?? ''}
            onValueChange={val => {
              const target = filteredOptions.find(item => item.id === val)
              target && setFocusedOptionId(target.id)
            }}
          >
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup
                className={cn(filteredOptions.length === 0 ? 'p-0' : 'p-1')}
              >
                {filteredOptions.map(option => (
                  <CommandItem
                    key={option.id}
                    defaultValue={option.id}
                    value={option.id}
                    onSelect={() => handleSelect(option)}
                    className={cn(
                      'px-1.5 py-1  data-[selected=true]:bg-secondary data-[selected=true]:text-foreground'
                    )}
                  >
                    {option.customRenderItem ? (
                      <option.customRenderItem {...option} />
                    ) : (
                      <MentionItemLayout
                        {...option.itemLayoutProps!}
                        details={
                          option.itemLayoutProps?.details ? (
                            option.itemLayoutProps.details
                          ) : option.children?.length ? (
                            <ArrowRightIcon className="size-4" />
                          ) : (
                            ''
                          )
                        }
                      />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </PopoverContent>
    </Popover>
  )
}
