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
  CommandItem,
  CommandList
} from '@webview/components/ui/command'
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
  const commandRef = useRef<HTMLDivElement>(null)

  useEvent('keydown', e => {
    if (commandRef.current && !commandRef.current.contains(e.target as Node)) {
      const event = new KeyboardEvent('keydown', {
        key: e.key,
        code: e.code,
        which: e.which,
        keyCode: e.keyCode,
        bubbles: true,
        cancelable: true
      })
      commandRef.current.dispatchEvent(event)
    }
  })

  const renderItem = (file: FileInfo) => {
    const isSelected = selectedFiles.some(f => f.fullPath === file.fullPath)

    const fileName = getFileNameFromPath(file.relativePath)

    return (
      <CommandItem
        key={file.fullPath}
        defaultValue={file.fullPath}
        value={file.fullPath}
        onSelect={() => {
          onSelect(file)
        }}
        className={cn(
          'cursor-pointer text-sm mx-2 px-1 py-1 flex items-center data-[selected=true]:bg-secondary data-[selected=true]:text-foreground'
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
      <Command loop ref={commandRef} shouldFilter={false}>
        <CommandList className="py-2">
          {!filteredFiles.length ? (
            <CommandEmpty>No files found.</CommandEmpty>
          ) : (
            filteredFiles.map(file => renderItem(file))
          )}
        </CommandList>
      </Command>
      <KeyboardShortcutsInfo shortcuts={keyboardShortcuts} />
    </div>
  )
}
