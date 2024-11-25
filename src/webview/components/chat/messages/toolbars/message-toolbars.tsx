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
import type { ButtonProps } from '@webview/components/ui/button'

import { BaseToolbar, type BaseToolbarProps } from './base-toolbar'

export interface MessageToolbarEvents {
  onCopy?: (conversation: Conversation) => void
  onEdit?: (conversation: Conversation) => void
  onDelete?: (conversation: Conversation) => void
  onRegenerate?: (conversation: Conversation) => void
}

export interface MessageToolbarProps
  extends Omit<BaseToolbarProps, 'buildChildren'>,
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
  <BaseToolbar
    {...props}
    buildChildren={({ isFloating }) => {
      const buttonProps: Partial<ButtonProps> = {
        variant: 'ghost',
        size: isFloating ? 'iconSm' : 'iconXs'
      }

      const iconClassName = isFloating ? 'size-4' : 'size-3'

      return (
        <>
          {/* copy */}
          {onCopy && (
            <ButtonWithTooltip
              tooltip="Copy"
              {...buttonProps}
              onClick={() => onCopy(conversation)}
            >
              <CopyIcon className={iconClassName} />
            </ButtonWithTooltip>
          )}

          {/* edit */}
          {onEdit && (
            <ButtonWithTooltip
              tooltip="Edit"
              {...buttonProps}
              onClick={() => onEdit(conversation)}
            >
              <Pencil2Icon className={iconClassName} />
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
              <ButtonWithTooltip tooltip="Delete" {...buttonProps}>
                <TrashIcon className={iconClassName} />
              </ButtonWithTooltip>
            </AlertAction>
          )}

          {/* regenerate */}
          {onRegenerate && (
            <ButtonWithTooltip
              tooltip="Regenerate"
              {...buttonProps}
              onClick={() => onRegenerate(conversation)}
            >
              <ReloadIcon className={iconClassName} />
            </ButtonWithTooltip>
          )}
        </>
      )
    }}
  />
)
