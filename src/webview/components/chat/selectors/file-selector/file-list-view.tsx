import React, { useRef } from 'react'
import { FileIcon } from '@webview/components/file-icon'
import {
  KeyboardShortcutsInfo,
  type ShortcutInfo
} from '@webview/components/keyboard-shortcuts-info'
import { TruncateStart } from '@webview/components/truncate-start'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@webview/components/ui/command'
import { useKeyboardNavigation } from '@webview/hooks/use-keyboard-navigation'
import { FileInfo } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { getFileNameFromPath } from '@webview/utils/path'
import { useEvent } from 'react-use'

const keyboardShortcuts: ShortcutInfo[] = [
  { key: ['↑', '↓'], description: 'Navigate', weight: 10 },
  { key: '↵', description: 'Select', weight: 9 }
]

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
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // eslint-disable-next-line react-compiler/react-compiler
  const { focusedIndex, handleKeyDown } = useKeyboardNavigation({
    listRef,
    itemCount: filteredFiles.length,
    itemRefs,
    onEnter: el => el?.click()
  })

  useEvent('keydown', handleKeyDown)

  const renderItem = (file: FileInfo, index: number) => {
    const isSelected = selectedFiles.some(f => f.fullPath === file.fullPath)

    const fileName = getFileNameFromPath(file.relativePath)

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
          'cursor-pointer text-sm px-1 py-1 flex items-center hover:bg-secondary',
          focusedIndex === index && 'bg-secondary'
        )}
      >
        <div className="flex flex-shrink-0 items-center mr-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={e => e.stopPropagation()}
            className="mx-1 custom-checkbox"
          />

          <FileIcon className="size-4 mr-1" filePath={file.relativePath} />
          <span>{fileName}</span>
        </div>
        <TruncateStart>{file.relativePath}</TruncateStart>
      </CommandItem>
    )
  }

  return (
    <div className="flex flex-col h-full pt-1">
      <Command shouldFilter={false}>
        <CommandList ref={listRef}>
          <CommandEmpty>No files found.</CommandEmpty>
          <CommandGroup>
            {/* eslint-disable-next-line react-compiler/react-compiler */}
            {filteredFiles.map((file, index) => renderItem(file, index))}
          </CommandGroup>
        </CommandList>
      </Command>
      <KeyboardShortcutsInfo shortcuts={keyboardShortcuts} />
    </div>
  )
}
