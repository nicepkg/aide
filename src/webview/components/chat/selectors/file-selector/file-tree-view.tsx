import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRightIcon, FileIcon } from '@radix-ui/react-icons'
import { Tree, TreeItem, TreeNodeRenderProps } from '@webview/components/tree'
import { useKeyboardNavigation } from '@webview/hooks/use-keyboard-navigation'
import { FileInfo } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { useEvent } from 'react-use'

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
  const itemRefs = useRef<(HTMLInputElement | null)[]>([])
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

  useEffect(() => {
    if (!initializedRef.current) return

    const newAutoExpandedIds = new Set<string>()
    const expandSearchNodes = (items: TreeItem[]) => {
      items.forEach(item => {
        if (
          searchQuery &&
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          newAutoExpandedIds.add(item.id)
          getAllParentIds(treeItems, item.id).forEach(id =>
            newAutoExpandedIds.add(id)
          )
        }
        if (item.children) expandSearchNodes(item.children)
      })
    }

    expandSearchNodes(treeItems)
    setAutoExpandedIds(newAutoExpandedIds)
  }, [treeItems, searchQuery, getAllParentIds])

  const allExpandedIds = useMemo(
    () => new Set([...Array.from(expandedIds), ...Array.from(autoExpandedIds)]),
    [expandedIds, autoExpandedIds]
  )

  const { focusedIndex, handleKeyDown } = useKeyboardNavigation({
    itemCount: flattenedItems.length,
    itemRefs,
    onSpace: el => el?.parentElement?.click(),
    onEnter: el => el?.click()
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
      const index = flattenedItems.findIndex(
        flatItem => flatItem.id === item.id
      )
      return (
        <div
          className={cn(
            'flex items-center py-1 cursor-pointer',
            focusedIndex === index && 'bg-secondary'
          )}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={onToggleExpand}
        >
          {hasChildren ? (
            <ChevronRightIcon
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'transform rotate-90'
              )}
            />
          ) : (
            <FileIcon className="h-4 w-4 mr-2" />
          )}
          <input
            type="checkbox"
            checked={isSelected}
            ref={el => {
              if (itemRefs.current) {
                itemRefs.current[index] = el
              }
              if (el) el.indeterminate = isIndeterminate
            }}
            onChange={onToggleSelect}
            onClick={e => e.stopPropagation()}
            className="mx-1 w-4 h-4"
          />
          <span>{item.name}</span>
        </div>
      )
    },
    [focusedIndex, flattenedItems]
  )

  return (
    <Tree
      items={treeItems}
      selectedItemIds={selectedIds}
      expandedItemIds={Array.from(allExpandedIds)}
      onSelect={handleSelect}
      onExpand={handleExpand}
      renderItem={renderItem}
    />
  )
}

// Helper function to flatten tree items
function flattenTreeItems(items: TreeItem[]): TreeItem[] {
  return items.reduce((acc: TreeItem[], item) => {
    acc.push(item)
    if (item.children) {
      acc.push(...flattenTreeItems(item.children))
    }
    return acc
  }, [])
}

// Function to convert flat file structure to tree structure
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
      children,
      fullPath,
      relativePath: fullPath
    }
  }

  return Object.entries(root).map(([key, value]) =>
    buildTreeItems(value, [key])
  )
}
