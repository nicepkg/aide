import { useState } from 'react'
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
  type MeasuringConfiguration
} from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { Slottable } from '@radix-ui/react-slot'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@webview/components/ui/accordion'
import { Button } from '@webview/components/ui/button'

import { SortableCard } from './sortable-card'

export interface CardListProps<T> {
  // Basic props
  items: T[]
  idField: keyof T
  title?: string

  // Features control
  draggable?: boolean
  showDragOverlay?: boolean
  selectable?: boolean
  expandable?: boolean

  // Expansion control
  defaultExpandedIds?: string[]
  onExpandedChange?: (ids: string[]) => void

  // Actions
  onCreateItem?: () => void
  onDeleteItems?: (items: T[]) => void
  onReorderItems?: (items: T[]) => void

  // Render functions
  renderCard: (props: {
    item: T
    isSelected: boolean
    onSelect: (selected: boolean) => void
    dragHandleProps?: SyntheticListenerMap
    isExpanded?: boolean
  }) => React.ReactNode
  renderExpandedContent?: (item: T) => React.ReactNode

  // Optional actions in header
  headerLeftActions?: React.ReactNode
  headerRightActions?: React.ReactNode

  // Add minCardWidth prop with default value
  minCardWidth?: number

  // Add emptyContent prop
  emptyContent?: React.ReactNode
}

export function CardList<T>({
  items,
  idField,
  title,
  draggable = true,
  showDragOverlay = true,
  selectable = true,
  expandable = false,
  minCardWidth = 300,
  defaultExpandedIds = [],
  onExpandedChange,
  onCreateItem,
  onDeleteItems,
  onReorderItems,
  renderCard,
  renderExpandedContent,
  headerLeftActions,
  headerRightActions,
  emptyContent
}: CardListProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(defaultExpandedIds)
  )

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(items.map(item => String(item[idField]))))
    } else {
      setSelectedIds(new Set())
    }
  }

  const getSelectAllState = () => {
    const selectedCount = selectedIds.size
    const totalCount = items.length
    return {
      checked: selectedCount > 0,
      indeterminate: selectedCount > 0 && selectedCount < totalCount
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  // DnD sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id)
    setActiveId(id)
    setExpandedIds(new Set())
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(
        item => String(item[idField]) === String(active.id)
      )
      const newIndex = items.findIndex(
        item => String(item[idField]) === String(over.id)
      )

      const newItems = arrayMove(items, oldIndex, newIndex)
      onReorderItems?.(newItems)
    }

    setActiveId(null)
  }

  // Delete selected items
  const handleDeleteSelected = () => {
    const selectedItems = items.filter(item =>
      selectedIds.has(String(item[idField]))
    )
    onDeleteItems?.(selectedItems)
    setSelectedIds(new Set())
  }

  const handleExpandedChange = (id: string, expanded: boolean) => {
    const newExpandedIds = new Set(expandedIds)
    if (expanded) {
      newExpandedIds.add(id)
    } else {
      newExpandedIds.delete(id)
    }
    setExpandedIds(newExpandedIds)
    onExpandedChange?.(Array.from(newExpandedIds))
  }

  const renderCardWithExpansion = (
    item: T,
    isSelected: boolean,
    dragHandleProps?: SyntheticListenerMap
  ) => {
    const id = String(item[idField])
    const isExpanded = expandedIds.has(id)

    if (!expandable) {
      return renderCard({
        item,
        isSelected,
        onSelect: selected => handleSelectItem(id, selected),
        dragHandleProps,
        isExpanded
      })
    }

    return (
      <div className="border rounded-md p-2">
        <Accordion type="single" collapsible value={isExpanded ? id : ''}>
          <AccordionItem value={id} className="border-b-0">
            <AccordionTrigger
              className="hover:no-underline p-0"
              asChild
              onClick={() => handleExpandedChange(id, !isExpanded)}
            >
              <Slottable>
                <div>
                  {renderCard({
                    item,
                    isSelected,
                    onSelect: selected => handleSelectItem(id, selected),
                    dragHandleProps,
                    isExpanded
                  })}
                </div>
              </Slottable>
            </AccordionTrigger>
            {renderExpandedContent && (
              <AccordionContent>{renderExpandedContent(item)}</AccordionContent>
            )}
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  const measuring: MeasuringConfiguration = {
    droppable: {
      strategy: MeasuringStrategy.Always
    }
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  // Add default empty state component
  const renderDefaultEmptyContent = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/50">
      <div className="space-y-3">
        <h3 className="text-lg font-medium">No items yet</h3>
        {onCreateItem && (
          <Button onClick={onCreateItem} size="sm">
            <PlusIcon className="size-4 mr-2" />
            Create Item
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {title && <h2 className="font-medium">{title}</h2>}
          {headerLeftActions}
        </div>

        <div className="flex items-center gap-2">
          {headerRightActions}

          {selectable && (
            <div className="flex items-center gap-2">
              <ButtonWithTooltip
                variant="outline"
                size="xs"
                className="flex justify-between px-1 gap-2"
                tooltip={`You have selected ${selectedIds.size} items`}
                onClick={() => {
                  const { checked } = getSelectAllState()
                  handleSelectAll(!checked)
                }}
              >
                <input
                  type="checkbox"
                  ref={ref => {
                    if (ref) {
                      const { checked, indeterminate } = getSelectAllState()
                      ref.checked = checked
                      ref.indeterminate = indeterminate
                    }
                  }}
                  className="custom-checkbox !border-primary"
                />
                <span className="text-sm">{selectedIds.size}</span>
              </ButtonWithTooltip>

              {onDeleteItems && (
                <ButtonWithTooltip
                  variant="outline"
                  size="iconXs"
                  onClick={handleDeleteSelected}
                  tooltip="Delete selected items"
                  disabled={selectedIds.size === 0}
                >
                  <TrashIcon className="size-4" />
                </ButtonWithTooltip>
              )}
            </div>
          )}

          {onCreateItem && (
            <ButtonWithTooltip
              size="iconXs"
              onClick={onCreateItem}
              tooltip="Create new item"
            >
              <PlusIcon className="size-4" />
            </ButtonWithTooltip>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        emptyContent || renderDefaultEmptyContent()
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={draggable ? handleDragStart : undefined}
          onDragEnd={draggable ? handleDragEnd : undefined}
          measuring={measuring}
        >
          <SortableContext
            items={items.map(item => String(item[idField]))}
            strategy={rectSortingStrategy}
          >
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minCardWidth}px), 1fr))`
              }}
            >
              {items.map(item => {
                const id = String(item[idField])
                return (
                  <SortableCard key={id} id={id} draggable={draggable}>
                    {dragHandleProps =>
                      renderCardWithExpansion(
                        item,
                        selectedIds.has(id),
                        dragHandleProps
                      )
                    }
                  </SortableCard>
                )
              })}
            </div>
          </SortableContext>

          {draggable && showDragOverlay && (
            <DragOverlay dropAnimation={dropAnimation}>
              {activeId
                ? renderCardWithExpansion(
                    items.find(item => String(item[idField]) === activeId) as T,
                    selectedIds.has(activeId),
                    undefined
                  )
                : null}
            </DragOverlay>
          )}
        </DndContext>
      )}
    </div>
  )
}
