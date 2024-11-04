import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { DragHandleDots2Icon } from '@radix-ui/react-icons'
import type { AIModel } from '@shared/entities'
import { Checkbox } from '@webview/components/ui/checkbox'

interface ModelItemProps {
  model: AIModel
  dragHandleProps?: SyntheticListenerMap
  isRemote?: boolean
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
}

export const ModelItem: React.FC<ModelItemProps> = ({
  model,
  dragHandleProps,
  isRemote = false,
  isSelected = false,
  onSelect
}) => (
  <div className="flex items-center gap-2 p-2">
    {onSelect && (
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelect}
        onClick={e => e.stopPropagation()} // Prevent accordion from toggling
      />
    )}
    {!isRemote && dragHandleProps && (
      <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
        <DragHandleDots2Icon className="size-4 text-muted-foreground" />
      </div>
    )}
    <div className="flex-1">{model.name}</div>
  </div>
)
