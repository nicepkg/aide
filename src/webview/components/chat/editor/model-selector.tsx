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

import type { ModelOption } from './types'

interface ModelSelectorProps {
  selectedModel: ModelOption
  setSelectedModel: (model: ModelOption) => void
  modelOptions: ModelOption[]
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  modelOptions
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="xs">
        {selectedModel.label}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-48">
      <Command>
        <CommandInput placeholder="Search model..." />
        <CommandList>
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandGroup heading="Models">
            {modelOptions.map(option => (
              <CommandItem
                key={option.value}
                onSelect={() => setSelectedModel(option)}
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
