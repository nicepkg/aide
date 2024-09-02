import React, { useCallback, useRef } from 'react'
import {
  KeyboardShortcutsInfo,
  type ShortcutInfo
} from '@webview/components/keyboard-shortcuts-info'
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
import { getIconComponent } from '@webview/utils/file-icons/utils'
import { useEvent } from 'react-use'

const keyboardShortcuts: ShortcutInfo[] = [
  { key: ['↑', '↓'], description: 'Navigate', weight: 10 },
  { key: '↵', description: 'Select', weight: 9 },
  { key: 'esc', description: 'Close', weight: 8 }
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

      const fileName = getFileNameFromPath(file.relativePath)
      const MaterialSvgComponent = getIconComponent({
        isFolder: false,
        isOpen: false,
        name: file.relativePath
      })

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
          <div className="flex flex-1 items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={e => e.stopPropagation()}
              className="mx-1 custom-checkbox"
            />

            {MaterialSvgComponent ? (
              <MaterialSvgComponent className="h-4 w-4 mr-1" />
            ) : null}
            <span>{fileName}</span>
          </div>
        </CommandItem>
      )
    },
    [selectedFiles, onSelect, focusedIndex]
  )

  return (
    <div className="flex flex-col h-full">
      <Command shouldFilter={false}>
        <CommandList>
          <CommandEmpty>No files found.</CommandEmpty>
          <CommandGroup>
            {filteredFiles.map((file, index) => renderItem(file, index))}
          </CommandGroup>
        </CommandList>
      </Command>
      <KeyboardShortcutsInfo shortcuts={keyboardShortcuts} />
    </div>
  )
}
