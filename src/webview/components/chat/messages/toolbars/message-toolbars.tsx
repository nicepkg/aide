import type { FC } from 'react'
import {
  CopyIcon,
  Pencil2Icon,
  ReloadIcon,
  TrashIcon
} from '@radix-ui/react-icons'
import type { Conversation } from '@shared/entities'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import { AlertAction } from '@webview/components/ui/alert-action'

import { BaseToolbar, type BaseToolbarProps } from './base-toolbar'

export interface MessageToolbarEvents {
  onCopy?: (conversation: Conversation) => void
  onEdit?: (conversation: Conversation) => void
  onDelete?: (conversation: Conversation) => void
  onRegenerate?: (conversation: Conversation) => void
}

export interface MessageToolbarProps
  extends Omit<BaseToolbarProps, 'children'>,
    MessageToolbarEvents {
  conversation: Conversation
}

export const MessageToolbar: FC<MessageToolbarProps> = ({
  conversation,
  onCopy,
  onEdit,
  onDelete,
  onRegenerate,
  ...props
}) => (
  <BaseToolbar {...props}>
    {/* copy */}
    {onCopy && (
      <ButtonWithTooltip
        tooltip="Copy"
        variant="ghost"
        size="iconXs"
        onClick={() => onCopy(conversation)}
      >
        <CopyIcon className="size-3" />
      </ButtonWithTooltip>
    )}

    {/* edit */}
    {onEdit && (
      <ButtonWithTooltip
        tooltip="Edit"
        variant="ghost"
        size="iconXs"
        onClick={() => onEdit(conversation)}
      >
        <Pencil2Icon className="size-3" />
      </ButtonWithTooltip>
    )}

    {/* delete */}
    {onDelete && (
      <AlertAction
        title="Delete Items"
        description="Are you sure?"
        variant="destructive"
        confirmText="Delete"
        onConfirm={() => onDelete(conversation)}
      >
        <ButtonWithTooltip tooltip="Delete" variant="ghost" size="iconXs">
          <TrashIcon className="size-3" />
        </ButtonWithTooltip>
      </AlertAction>
    )}

    {/* regenerate */}
    {onRegenerate && (
      <ButtonWithTooltip
        tooltip="Regenerate"
        variant="ghost"
        size="iconXs"
        onClick={() => onRegenerate(conversation)}
      >
        <ReloadIcon className="size-3" />
      </ButtonWithTooltip>
    )}
  </BaseToolbar>
)
