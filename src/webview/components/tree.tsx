import React, { useCallback, useEffect, useRef } from 'react'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { useControllableState } from '@webview/hooks/use-controllable-state'
import { cn } from '@webview/utils/common'

export interface TreeItem {
  id: string
  name: string
  children?: TreeItem[]
  isLeaf?: boolean
  [key: string]: any
}

export interface TreeNodeRenderProps {
  item: TreeItem
  isSelected: boolean
  isIndeterminate: boolean
  isExpanded: boolean
  hasChildren: boolean
  onToggleSelect: () => void
  onToggleExpand: () => void
  level: number
}

interface TreeProps {
  items: TreeItem[]
  selectedItemIds?: string[]
  expandedItemIds?: string[]
  onSelect?: (selectedIds: string[]) => void
  onExpand?: (expandedIds: string[]) => void
  className?: string
  renderItem?: (props: TreeNodeRenderProps) => React.ReactNode
}

export const Tree: React.FC<TreeProps> = ({
  items,
  selectedItemIds = [],
  expandedItemIds = [],
  onSelect,
  onExpand,
  className,
  renderItem
}) => {
  const [selected, setSelected] = useControllableState({
    prop: new Set(selectedItemIds),
    defaultProp: new Set<string>(),
    onChange: newSelected => onSelect?.(Array.from(newSelected))
  })

  const [expanded, setExpanded] = useControllableState({
    prop: new Set(expandedItemIds),
    defaultProp: new Set<string>(),
    onChange: newExpanded => onExpand?.(Array.from(newExpanded))
  })

  const getLeafIds = useCallback((item: TreeItem): string[] => {
    if (item.isLeaf) {
      return [item.id]
    }
    return (item.children || []).flatMap(getLeafIds)
  }, [])

  const isItemSelected = useCallback(
    (item: TreeItem): boolean => {
      if (item.isLeaf) {
        return selected?.has(item.id) ?? false
      }
      const leafIds = getLeafIds(item)
      return leafIds.every(id => selected?.has(id))
    },
    [selected, getLeafIds]
  )

  const isItemIndeterminate = useCallback(
    (item: TreeItem): boolean => {
      if (item.isLeaf) {
        return false
      }
      const leafIds = getLeafIds(item)
      const selectedLeafs = leafIds.filter(id => selected?.has(id))
      return selectedLeafs.length > 0 && selectedLeafs.length < leafIds.length
    },
    [selected, getLeafIds]
  )

  const handleSelect = useCallback(
    (item: TreeItem) => {
      const newSelected = new Set(selected)
      const leafIds = getLeafIds(item)

      if (isItemSelected(item)) {
        leafIds.forEach(id => newSelected.delete(id))
      } else {
        leafIds.forEach(id => newSelected.add(id))
      }

      setSelected(newSelected)
    },
    [selected, getLeafIds, isItemSelected, setSelected]
  )

  const handleExpand = useCallback(
    (itemId: string) => {
      const newExpanded = new Set(expanded)
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId)
      } else {
        newExpanded.add(itemId)
      }
      setExpanded(newExpanded)
    },
    [expanded, setExpanded]
  )

  const renderTreeItems = useCallback(
    (treeItems: TreeItem[], level = 0) =>
      treeItems.map(item => (
        <TreeNode
          key={item.id}
          item={item}
          isSelected={isItemSelected(item)}
          isIndeterminate={isItemIndeterminate(item)}
          isExpanded={expanded?.has(item.id) ?? false}
          onToggleSelect={() => handleSelect(item)}
          onToggleExpand={() => handleExpand(item.id)}
          renderItem={renderItem}
          level={level}
        >
          {item.children &&
            expanded?.has(item.id) &&
            renderTreeItems(item.children, level + 1)}
        </TreeNode>
      )),
    [
      isItemSelected,
      isItemIndeterminate,
      expanded,
      handleSelect,
      handleExpand,
      renderItem
    ]
  )

  return (
    <ScrollArea className={cn('h-full w-full', className)}>
      <div className="p-2">{renderTreeItems(items)}</div>
    </ScrollArea>
  )
}

interface TreeNodeProps {
  item: TreeItem
  isSelected: boolean
  isIndeterminate: boolean
  isExpanded: boolean
  onToggleSelect: () => void
  onToggleExpand: () => void
  children?: React.ReactNode
  renderItem?: (props: TreeNodeRenderProps) => React.ReactNode
  level: number
}

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  isSelected,
  isIndeterminate,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  children,
  renderItem,
  level
}) => {
  const hasChildren = !!(item.children && item.children.length)
  const checkboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  const renderProps: TreeNodeRenderProps = {
    item,
    isSelected,
    isIndeterminate,
    isExpanded,
    hasChildren,
    onToggleSelect,
    onToggleExpand,
    level
  }

  const content = renderItem ? (
    renderItem(renderProps)
  ) : (
    <div
      className={cn('flex items-center py-1 cursor-pointer')}
      style={{ marginLeft: `${level * 20}px` }}
    >
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="mx-1 w-4 h-4"
      />
      <span onClick={onToggleExpand}>{item.name}</span>
    </div>
  )

  return (
    <div>
      {content}
      {hasChildren && isExpanded && children}
    </div>
  )
}
