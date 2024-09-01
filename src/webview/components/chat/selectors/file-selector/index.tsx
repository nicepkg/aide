import React, { useEffect, useRef, useState } from 'react'
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
import { useControllableState } from '@webview/hooks/use-controllable-state'
import { useFileSearch } from '@webview/hooks/use-file-search'
import { useKeyboardNavigation } from '@webview/hooks/use-keyboard-navigation'
import type { FileInfo } from '@webview/types/chat'

import { FileListView } from './file-list-view'
import { FileTreeView } from './file-tree-view'

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

  const { searchQuery, setSearchQuery, filteredFiles } = useFileSearch()
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
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

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(e)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0"
        side="top"
        align="start"
        onCloseAutoFocus={e => e.preventDefault()}
      >
        <div className="p-2">
          <Input
            ref={inputRef}
            value={topSearchQuery}
            onChange={e => setTopSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search files..."
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
              >
                {tab.label}
              </TabsTrigger>
            ))}
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
