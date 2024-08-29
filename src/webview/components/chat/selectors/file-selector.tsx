import React from 'react'
// 添加 PlusIcon

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
import { useFileSearch } from '@webview/hooks/use-file-search'
import type { FileInfo } from '@webview/types/chat'
import { getFileNameFromPath, removeDuplicates } from '@webview/utils/common'

interface FileSelectorProps {
  selectedFiles: FileInfo[]
  children: React.ReactNode
  onChange: (files: FileInfo[]) => void
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  selectedFiles,
  children,
  onChange
}) => {
  const { searchQuery, setSearchQuery, filteredFiles } = useFileSearch()

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-64" side="top">
        <Command>
          <CommandInput
            placeholder="Search files..."
            value={searchQuery}
            onValueChange={search => setSearchQuery(search)}
          />
          <CommandList>
            <CommandEmpty>No files found.</CommandEmpty>
            <CommandGroup heading="Files">
              {filteredFiles.map((file, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => {
                    onChange(
                      removeDuplicates([...selectedFiles, file], ['fullPath'])
                    )
                  }}
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
