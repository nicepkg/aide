import React, { useCallback, useRef } from 'react'
import { CheckIcon } from '@radix-ui/react-icons'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@webview/components/ui/command'
import { useKeyboardNavigation } from '@webview/hooks/use-keyboard-navigation'
import { FileInfo } from '@webview/types/chat'
import { cn, getFileNameFromPath } from '@webview/utils/common'
import { useEvent } from 'react-use'

interface FileListViewProps {
  filteredFiles: FileInfo[]
  selectedFiles: FileInfo[]
  onSelect: (file: FileInfo) => void
}

export const FileListView: React.FC<FileListViewProps> = ({
  filteredFiles,
  selectedFiles,
  onSelect
}) => {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const { focusedIndex, handleKeyDown } = useKeyboardNavigation({
    itemCount: filteredFiles.length,
    itemRefs,
    onEnter: el => el?.click()
  })

  useEvent('keydown', handleKeyDown)

  const renderItem = useCallback(
    (file: FileInfo, index: number) => {
      const isSelected = selectedFiles.some(f => f.fullPath === file.fullPath)
      return (
        <CommandItem
          key={file.fullPath}
          defaultValue=""
          value=""
          onSelect={() => onSelect(file)}
          ref={el => {
            if (itemRefs.current) {
              itemRefs.current[index] = el
            }
          }}
          className={cn(
            'px-1.5 py-1 flex items-center justify-between',
            isSelected && 'text-primary',
            focusedIndex === index && 'text-accent-foreground bg-accent'
          )}
        >
          <span>{getFileNameFromPath(file.relativePath)}</span>
          {isSelected && <CheckIcon className="h-4 w-4 text-primary" />}
        </CommandItem>
      )
    },
    [selectedFiles, onSelect, focusedIndex]
  )

  return (
    <Command shouldFilter={false}>
      <CommandList>
        <CommandEmpty>No files found.</CommandEmpty>
        <CommandGroup>
          {filteredFiles.map((file, index) => renderItem(file, index))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
