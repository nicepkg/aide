import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  KeyboardShortcutsInfo,
  type ShortcutInfo
} from '@webview/components/keyboard-shortcuts-info'
import { Input } from '@webview/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@webview/components/ui/popover'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@webview/components/ui/tabs'
import { useFilesSearch } from '@webview/hooks/chat/use-files-search'
import { useControllableState } from '@webview/hooks/use-controllable-state'
import { useKeyboardNavigation } from '@webview/hooks/use-keyboard-navigation'
import type { FileInfo } from '@webview/types/chat'
import { useEvent } from 'react-use'

import { FileListView } from './file-list-view'
import { FileTreeView } from './file-tree-view'

const keyboardShortcuts: ShortcutInfo[] = [
  { key: '⇥', description: 'Switch tab', weight: 10 },
  { key: 'esc', description: 'Close', weight: 9 }
]

interface FileSelectorProps {
  selectedFiles: FileInfo[]
  onChange: (files: FileInfo[]) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const tabOptions = [
  { value: 'list', label: 'List' },
  { value: 'tree', label: 'Tree' }
] as const

type TabOption = (typeof tabOptions)[number]['value']

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

  const { searchQuery, setSearchQuery, filteredFiles } = useFilesSearch()
  const [activeTab, setActiveTab] = useState<TabOption>('list')
  const [topSearchQuery, setTopSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const { handleKeyDown, setFocusedIndex } = useKeyboardNavigation({
    itemCount: tabOptions.length,
    itemRefs: tabRefs,
    mode: 'tab',
    defaultStartIndex: tabOptions.findIndex(t => t.value === activeTab),
    onTab: (_, index) => setActiveTab(tabOptions[index]?.value ?? 'list')
  })

  useEffect(() => {
    setSearchQuery(topSearchQuery)
  }, [topSearchQuery, setSearchQuery])

  useLayoutEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    } else {
      setTopSearchQuery('')
    }
  }, [isOpen])

  const handleTreeSelect = (files: FileInfo[]) => {
    onChange(files)
  }

  const handleListSelect = (file: FileInfo) => {
    const newSelectedFiles = selectedFiles.some(
      f => f.fullPath === file.fullPath
    )
      ? selectedFiles.filter(f => f.fullPath !== file.fullPath)
      : [...selectedFiles, file]
    onChange(newSelectedFiles)
  }

  useEvent('keydown', handleKeyDown)

  const queryClient = useQueryClient()
  useEffect(() => {
    if (!isOpen) return
    queryClient.invalidateQueries({
      queryKey: ['realtime']
    })
  }, [isOpen, queryClient])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="min-w-[200px] max-w-[400px] w-screen p-0"
        side="top"
        align="start"
        onCloseAutoFocus={e => e.preventDefault()}
      >
        <div className="p-2">
          <Input
            ref={inputRef}
            value={topSearchQuery}
            onChange={e => setTopSearchQuery(e.target.value)}
            placeholder="Search files..."
            autoFocus
          />
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(value: string) => {
            setActiveTab(value as TabOption)
            setFocusedIndex(tabOptions.findIndex(t => t.value === value))
          }}
          className="h-[300px] flex flex-col"
        >
          <TabsList mode="underlined">
            {tabOptions.map((tab, index) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                mode="underlined"
                ref={el => {
                  if (el) {
                    tabRefs.current[index] = el
                  }
                }}
                onKeyDown={e => e.preventDefault()}
              >
                {tab.label}
              </TabsTrigger>
            ))}
            <KeyboardShortcutsInfo
              className="border-t-0 opacity-70"
              shortcuts={keyboardShortcuts}
            />
          </TabsList>
          <div className="flex-grow overflow-auto">
            <TabsContent value="list" className="h-full mt-0">
              <FileListView
                filteredFiles={filteredFiles}
                selectedFiles={selectedFiles}
                onSelect={handleListSelect}
              />
            </TabsContent>
            <TabsContent value="tree" className="h-full mt-0">
              <FileTreeView
                files={filteredFiles}
                selectedFiles={selectedFiles}
                onSelect={handleTreeSelect}
                searchQuery={searchQuery}
              />
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
