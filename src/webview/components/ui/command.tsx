import * as React from 'react'
import { type DialogProps } from '@radix-ui/react-dialog'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@webview/components/ui/dialog'
import { cn } from '@webview/utils/common'
import { Command as CommandPrimitive, useCommandState } from 'cmdk'

const Command: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive>
> = ({ ref, className, ...props }) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-2xl bg-popover text-popover-foreground',
      className
    )}
    {...props}
  />
)
Command.displayName = CommandPrimitive.displayName

export const CommandHook: React.FC<{ onFocus: (val: string) => void }> = ({
  onFocus
}) => {
  const val = useCommandState(state => state.value)

  React.useEffect(() => {
    onFocus(val)
  }, [val])

  return null
}

interface CommandDialogProps extends DialogProps {
  dialogContentClassName?: string
  commandClassName?: string
}

const CommandDialog = ({
  children,
  dialogContentClassName,
  commandClassName,
  ...props
}: CommandDialogProps) => (
  <Dialog {...props}>
    <DialogContent
      hideClose
      className={cn(
        'overflow-hidden p-0 max-w-[400px] w-[calc(100vw-1rem)] rounded-md',
        dialogContentClassName
      )}
    >
      <VisuallyHidden>
        <DialogHeader>
          <DialogTitle />
          <DialogDescription />
        </DialogHeader>
      </VisuallyHidden>

      <Command
        className={cn(
          '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5',
          commandClassName
        )}
      >
        {children}
      </Command>
    </DialogContent>
  </Dialog>
)

const CommandInput: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.Input> & {
    hidden?: boolean
    showSearchIcon?: boolean
  }
> = ({ ref, className, hidden, showSearchIcon = true, ...props }) => (
  <div
    className={cn('flex items-center border-b px-3', hidden && 'hidden')}
    cmdk-input-wrapper=""
  >
    {showSearchIcon && (
      <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    )}
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-foreground/50 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
)

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.List>
> = ({ ref, className, ...props }) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
)

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.Empty>
> = ({ ref, ...props }) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none"
    {...props}
  />
)

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.Group>
> = ({ ref, className, ...props }) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
      className
    )}
    {...props}
  />
)

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.Separator>
> = ({ ref, className, ...props }) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
)
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.Item>
> = ({ ref, className, ...props }) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50',
      className
    )}
    {...props}
  />
)

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      'ml-auto text-xs tracking-widest text-muted-foreground',
      className
    )}
    {...props}
  />
)
CommandShortcut.displayName = 'CommandShortcut'

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator
}
