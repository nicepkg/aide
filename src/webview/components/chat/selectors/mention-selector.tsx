/* eslint-disable unused-imports/no-unused-vars */
import React, { useState } from 'react'
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
  children: React.ReactNode
}

export const MentionSelector: React.FC<MentionSelectorProps> = ({
  mentionOptions,
  onSelect,
  open,
  onOpenChange,
  children
}) => {
  const [isOpen = false, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: false,
    onChange: onOpenChange
  })

  // TODO: implement selected strategy and data
  const [selectedStrategy, setSelectedStrategy] = useState<IMentionStrategy>()
  const [selectedStrategyData, setSelectedStrategyData] = useState<any>()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-48">
        <Command>
          <CommandInput placeholder="Search mention..." />
          <CommandList>
            <CommandEmpty>No mention found.</CommandEmpty>
            <CommandGroup heading="Mention Types">
              {mentionOptions.map(option => (
                <CommandItem
                  key={option.category}
                  onSelect={() => {
                    if (!selectedStrategy) return
                    onSelect({
                      strategy: selectedStrategy,
                      strategyAddData: selectedStrategyData
                    })
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
