import { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@webview/components/ui/alert-dialog'
import { cn } from '@webview/utils/common'

interface AlertActionProps {
  // Trigger element props
  children: ReactNode
  className?: string
  asChild?: boolean

  // Alert dialog props
  title?: string
  description?: string
  cancelText?: string
  confirmText?: string
  variant?: 'default' | 'destructive'
  disabled?: boolean

  // Callbacks
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export const AlertAction = ({
  // Trigger props
  children,
  className,
  asChild = true,

  // Alert dialog props
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  cancelText = 'Cancel',
  confirmText = 'Continue',
  variant = 'default',
  disabled = false,

  // Callbacks
  onConfirm,
  onCancel
}: AlertActionProps) => {
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild} disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent
        className={cn('w-[calc(100vw-2rem)] rounded-lg', className)}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={cn(
              variant === 'destructive' &&
                'bg-destructive hover:bg-destructive/90'
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
