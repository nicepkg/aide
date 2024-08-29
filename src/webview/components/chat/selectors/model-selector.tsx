import React from 'react'
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
import type { ModelOption } from '@webview/types/chat'

interface ModelSelectorProps {
  modelOptions: ModelOption[]
  onSelect: (model: ModelOption) => void
  children: React.ReactNode
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  modelOptions,
  onSelect,
  children
}) => (
  <Popover>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent className="w-48">
      <Command>
        <CommandInput placeholder="Search model..." />
        <CommandList>
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandGroup heading="Models">
            {modelOptions.map(option => (
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
