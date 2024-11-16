import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { cn } from '@webview/utils/common'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay: React.FC<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Overlay>
> = ({ ref, className, ...props }) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent: React.FC<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Content> & {
    hideClose?: boolean
    withBlur?: boolean
    blurClassName?: string
  }
> = ({
  ref,
  className,
  children,
  hideClose,
  withBlur = true,
  blurClassName,
  ...props
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null)

  return (
    <DialogPortal>
      {withBlur ? (
        <DialogOverlay
          className={cn('backdrop-blur-[4px] bg-black/10', blurClassName)}
        />
      ) : (
        <DialogOverlay />
      )}
      <div
        className="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        ref={el => {
          if (el) {
            el.dataset.state = contentRef.current?.dataset?.state
          }
        }}
      >
        <DialogPrimitive.Content
          ref={el => {
            if (el) {
              contentRef.current = el
              if (typeof ref === 'function') {
                ref(el)
              } else if (ref) {
                ref.current = el
              }
            }
          }}
          className={cn(
            'relative grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
            className
          )}
          {...props}
        >
          {children}
          {!hideClose && (
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <Cross2Icon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  )
}
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle: React.FC<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Title>
> = ({ ref, className, ...props }) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription: React.FC<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Description>
> = ({ ref, className, ...props }) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
)
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
}
