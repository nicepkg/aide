import React, { useCallback } from 'react'
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
import { useFileSearch } from '@webview/hooks/use-file-search'
import type { FileInfo } from '@webview/types/chat'
import { getFileNameFromPath, removeDuplicates } from '@webview/utils/common'

interface FileSelectorProps {
  selectedFiles: FileInfo[]
  onChange: (files: FileInfo[]) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  selectedFiles,
  onChange,
  open,
  onOpenChange,
  children
}) => {
  const [isOpen, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: false,
    onChange: onOpenChange
  })

  const { searchQuery, setSearchQuery, filteredFiles } = useFileSearch()

  const handleSelect = useCallback(
    (file: FileInfo) => {
      onChange(removeDuplicates([...selectedFiles, file], ['fullPath']))
      setIsOpen(false)
    },
    [selectedFiles, onChange, setIsOpen]
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        updatePositionStrategy="optimized"
        side="top"
        align="start"
      >
        <Command>
          <CommandInput
            showSearchIcon={false}
            placeholder="Search files..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No files found.</CommandEmpty>
            <CommandGroup>
              {filteredFiles.map((file, index) => (
                <CommandItem
                  key={index}
                  value={file.fullPath}
                  onSelect={() => handleSelect(file)}
                  className="px-1.5 py-1"
                >
                  {getFileNameFromPath(file.relativePath)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
