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
import { useControllableState } from '@webview/hooks/use-controllable-state'
import type { ModelOption } from '@webview/types/chat'

interface ModelSelectorProps {
  modelOptions: ModelOption[]
  onSelect: (model: ModelOption) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  modelOptions,
  onSelect,
  open,
  onOpenChange,
  children
}) => {
  const [isOpen, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: false,
    onChange: onOpenChange
  })

  const handleSelect = (currentValue: string) => {
    const selectedOption = modelOptions.find(
      option => option.value === currentValue
    )
    if (selectedOption) {
      onSelect(selectedOption)
    }
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        updatePositionStrategy="optimized"
        side="bottom"
        align="start"
      >
        <Command>
          <CommandInput
            showSearchIcon={false}
            placeholder="Search model..."
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {modelOptions.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
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
