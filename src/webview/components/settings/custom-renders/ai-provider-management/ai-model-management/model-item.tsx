import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { DragHandleDots2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import type { AIModel } from '@shared/entities'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import { Checkbox } from '@webview/components/ui/checkbox'

interface ModelItemProps {
  model: AIModel
  dragHandleProps?: SyntheticListenerMap
  isRemote?: boolean
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  onDelete?: (model: AIModel) => void
  onAdd?: (model: AIModel) => void
}

export const ModelItem: React.FC<ModelItemProps> = ({
  model,
  dragHandleProps,
  isRemote = false,
  isSelected = false,
  onSelect,
  onDelete,
  onAdd
}) => (
  <div className="flex items-center gap-2 w-full">
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
    <div className="flex-1 text-foreground/80">{model.name}</div>
    <div className="flex gap-2">
      {!isRemote && onDelete && (
        <ButtonWithTooltip
          variant="ghost"
          size="sm"
          tooltip="Delete"
          className="h-7 w-7 p-0 hover:bg-muted text-destructive hover:text-destructive"
          onClick={e => {
            e.stopPropagation()
            onDelete(model)
          }}
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </ButtonWithTooltip>
      )}
      {isRemote && onAdd && (
        <ButtonWithTooltip
          variant="ghost"
          size="sm"
          tooltip="Add to manual"
          className="h-7 w-7 p-0 hover:bg-muted"
          onClick={e => {
            e.stopPropagation()
            onAdd(model)
          }}
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </ButtonWithTooltip>
      )}
    </div>
  </div>
)
