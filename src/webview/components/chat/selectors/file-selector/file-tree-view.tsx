import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { FileIcon } from '@webview/components/file-icon'
import {
  KeyboardShortcutsInfo,
  type ShortcutInfo
} from '@webview/components/keyboard-shortcuts-info'
import { Tree, TreeItem, TreeNodeRenderProps } from '@webview/components/tree'
import { useKeyboardNavigation } from '@webview/hooks/use-keyboard-navigation'
import { FileInfo } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { useEvent } from 'react-use'

const keyboardShortcuts: ShortcutInfo[] = [
  { key: ['↑', '↓'], description: 'Navigate', weight: 10 },
  { key: '↵', description: 'Select', weight: 9 },
  { key: '⌘↵', description: 'Expand', weight: 8 }
]

interface FileTreeViewProps {
  files: FileInfo[]
  selectedFiles: FileInfo[]
  onSelect: (files: FileInfo[]) => void
  searchQuery: string
}

export const FileTreeView: React.FC<FileTreeViewProps> = ({
  files,
  selectedFiles,
  onSelect,
  searchQuery
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [autoExpandedIds, setAutoExpandedIds] = useState<Set<string>>(new Set())
  const initializedRef = useRef(false)
  const visibleItemRefs = useRef<(HTMLInputElement | null)[]>([])
  const treeItems = useMemo(() => convertFilesToTreeItems(files), [files])
  const flattenedItems = useMemo(() => flattenTreeItems(treeItems), [treeItems])

  const selectedIds = useMemo(
    () => selectedFiles.map(file => file.fullPath),
    [selectedFiles]
  )

  const handleSelect = useCallback(
    (newSelectedIds: string[]) => {
      const newSelectedFiles = files.filter(file =>
        newSelectedIds.includes(file.fullPath)
      )
      onSelect(newSelectedFiles)
    },
    [files, onSelect]
  )

  const handleExpand = useCallback((newExpandedIds: string[]) => {
    setExpandedIds(new Set(newExpandedIds))
  }, [])

  const getAllParentIds = useCallback(
    (items: TreeItem[], targetId: string, path: string[] = []): string[] => {
      for (const item of items) {
        const currentPath = [...path, item.id]
        if (item.id === targetId) return path
        if (item.children) {
          const result = getAllParentIds(item.children, targetId, currentPath)
          if (result.length > 0) return result
        }
      }
      return []
    },
    []
  )

  useEffect(() => {
    if (initializedRef.current) return

    const newAutoExpandedIds = new Set<string>()
    const expandInitialNodes = (items: TreeItem[]) => {
      items.forEach(item => {
        if (selectedIds.includes(item.id)) {
          newAutoExpandedIds.add(item.id)
          getAllParentIds(treeItems, item.id).forEach(id =>
            newAutoExpandedIds.add(id)
          )
        }
        if (item.children) expandInitialNodes(item.children)
      })
    }

    expandInitialNodes(treeItems)
    setAutoExpandedIds(newAutoExpandedIds)
    initializedRef.current = true
  }, [treeItems, selectedIds, getAllParentIds])

  // useEffect(() => {
  //   if (!initializedRef.current) return

  //   const newAutoExpandedIds = new Set<string>()
  //   const expandSearchNodes = (items: TreeItem[]) => {
  //     items.forEach(item => {
  //       if (
  //         searchQuery &&
  //         item.name.toLowerCase().includes(searchQuery.toLowerCase())
  //       ) {
  //         newAutoExpandedIds.add(item.id)
  //         getAllParentIds(treeItems, item.id).forEach(id =>
  //           newAutoExpandedIds.add(id)
  //         )
  //       }
  //       if (item.children) expandSearchNodes(item.children)
  //     })
  //   }

  //   expandSearchNodes(treeItems)
  //   setAutoExpandedIds(newAutoExpandedIds)
  // }, [treeItems, searchQuery, getAllParentIds])

  useEffect(() => {
    if (!initializedRef.current) return

    const newAutoExpandedIds = new Set<string>()
    const expandSearchNodes = (items: TreeItem[]): boolean => {
      let shouldExpand = false
      items.forEach(item => {
        if (
          searchQuery &&
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          newAutoExpandedIds.add(item.id)
          getAllParentIds(treeItems, item.id).forEach(id =>
            newAutoExpandedIds.add(id)
          )
          shouldExpand = true
        }

        if (item.children) {
          const childrenMatch = expandSearchNodes(item.children)
          if (childrenMatch) {
            newAutoExpandedIds.add(item.id)
            shouldExpand = true
          }
        }
      })
      return shouldExpand
    }

    expandSearchNodes(treeItems)
    setAutoExpandedIds(newAutoExpandedIds)
  }, [treeItems, searchQuery, getAllParentIds])

  const allExpandedIds = useMemo(
    () => new Set([...Array.from(expandedIds), ...Array.from(autoExpandedIds)]),
    [expandedIds, autoExpandedIds]
  )

  const getVisibleItems = useCallback(
    () =>
      flattenedItems.filter(item => {
        const parentIds = getAllParentIds(treeItems, item.id)
        return parentIds.every(id => allExpandedIds.has(id))
      }),
    [flattenedItems, getAllParentIds, treeItems, allExpandedIds]
  )

  const visibleItems = useMemo(() => getVisibleItems(), [getVisibleItems])

  const getVisibleIndex = useCallback(
    (index: number) => {
      const visibleItems = getVisibleItems()
      return visibleItems.findIndex((item, i) => i === index)
    },
    [getVisibleItems]
  )

  const { focusedIndex, handleKeyDown } = useKeyboardNavigation({
    itemCount: visibleItems.length,
    itemRefs: visibleItemRefs,
    onCtrlEnter: el => el?.parentElement?.click(),
    onEnter: el => el?.click(),
    getVisibleIndex
  })

  useEvent('keydown', handleKeyDown)

  const renderItem = useCallback(
    ({
      item,
      isSelected,
      isIndeterminate,
      isExpanded,
      hasChildren,
      onToggleSelect,
      onToggleExpand,
      level
    }: TreeNodeRenderProps) => {
      const visibleIndex = visibleItems.findIndex(
        visibleItem => visibleItem.id === item.id
      )

      const ArrowIcon = isExpanded ? ChevronDownIcon : ChevronRightIcon

      return (
        <div
          className={cn(
            'flex items-center py-1 text-sm cursor-pointer',
            visibleIndex === focusedIndex && 'bg-secondary'
          )}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={onToggleExpand}
        >
          <input
            type="checkbox"
            checked={isSelected}
            ref={el => {
              if (visibleItemRefs.current) {
                visibleItemRefs.current[visibleIndex] = el
              }
              if (el) el.indeterminate = isIndeterminate
            }}
            onChange={onToggleSelect}
            onClick={e => e.stopPropagation()}
            className="mx-1 custom-checkbox"
          />

          {hasChildren && <ArrowIcon className="size-4 mr-1" />}

          <FileIcon
            className="size-4 mr-1"
            isFolder={hasChildren}
            isOpen={isExpanded}
            filePath={item.name}
          />

          <span>{item.name}</span>
        </div>
      )
    },
    [focusedIndex, visibleItems]
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 overflow-auto">
        <Tree
          items={treeItems}
          selectedItemIds={selectedIds}
          expandedItemIds={Array.from(allExpandedIds)}
          onSelect={handleSelect}
          onExpand={handleExpand}
          renderItem={renderItem}
        />
      </div>
      <KeyboardShortcutsInfo shortcuts={keyboardShortcuts} />
    </div>
  )
}

// Helper functions (flattenTreeItems and convertFilesToTreeItems) remain unchanged
function flattenTreeItems(items: TreeItem[]): TreeItem[] {
  return items.reduce((acc: TreeItem[], item) => {
    acc.push(item)
    if (item.children) {
      acc.push(...flattenTreeItems(item.children))
    }
    return acc
  }, [])
}

function convertFilesToTreeItems(files: FileInfo[]): TreeItem[] {
  const root: Record<string, any> = {}

  files.forEach(file => {
    const parts = file.relativePath.split('/')
    let current = root

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] =
          index === parts.length - 1 ? { ...file, isLeaf: true } : {}
      }
      if (index < parts.length - 1) current = current[part]
    })
  })

  const sortItems = (items: TreeItem[]): TreeItem[] =>
    items.sort((a, b) => {
      // Folders come before files
      if (a.children && !b.children) return -1
      if (!a.children && b.children) return 1

      // Alphabetical sorting within each group
      return a.name.localeCompare(b.name)
    })

  const buildTreeItems = (node: any, path: string[] = []): TreeItem => {
    const name = path[path.length - 1] || 'root'
    const fullPath = path.join('/')

    if (node.isLeaf) {
      return {
        id: node.fullPath,
        name,
        isLeaf: true,
        fullPath: node.fullPath,
        relativePath: node.relativePath
      }
    }

    const children = Object.entries(node).map(([key, value]) =>
      buildTreeItems(value, [...path, key])
    )

    return {
      id: fullPath || 'root',
      name,
      children: sortItems(children),
      fullPath,
      relativePath: fullPath
    }
  }

  return sortItems(
    Object.entries(root).map(([key, value]) => buildTreeItems(value, [key]))
  )
}
