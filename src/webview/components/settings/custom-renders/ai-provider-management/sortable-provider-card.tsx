import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type AIProvider } from '@shared/utils/ai-providers'

import { ProviderCard } from './provider-card'

export const SortableProviderCard = ({
  provider,
  onEdit,
  onRemove
}: {
  provider: AIProvider
  onEdit: (provider: AIProvider) => void
  onRemove: (id: string) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: provider.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ProviderCard
        provider={provider}
        onEdit={onEdit}
        onRemove={onRemove}
        dragHandleProps={listeners}
      />
    </div>
  )
}
