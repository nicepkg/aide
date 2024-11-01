import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableCardProps {
  id: string
  children: (dragHandleProps?: any) => React.ReactNode
  draggable?: boolean
}

export const SortableCard = ({
  id,
  children,
  draggable = true
}: SortableCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    disabled: !draggable
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(draggable ? listeners : undefined)}
    </div>
  )
}
