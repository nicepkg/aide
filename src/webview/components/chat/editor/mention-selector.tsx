import React from 'react'
import { Button } from '@webview/components/ui/button'
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

import type { MentionOption } from './types'

interface MentionSelectorProps {
  mentionOptions: MentionOption[]
  onSelect: (option: MentionOption) => void
}

export const MentionSelector: React.FC<MentionSelectorProps> = ({
  mentionOptions,
  onSelect
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="xs" className="ml-2">
        @ Mention
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-48">
      <Command>
        <CommandInput placeholder="Search mention..." />
        <CommandList>
          <CommandEmpty>No mention found.</CommandEmpty>
          <CommandGroup heading="Mention Types">
            {mentionOptions.map(option => (
              <CommandItem key={option.value} onSelect={() => onSelect(option)}>
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
)
