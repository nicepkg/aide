import * as React from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { cn } from '@webview/utils/common'

const ScrollArea: React.FC<
  React.ComponentPropsWithRef<typeof ScrollAreaPrimitive.Root> & {
    viewPortProps?: React.ComponentPropsWithRef<
      typeof ScrollAreaPrimitive.Viewport
    >
  }
> = ({ ref, className, children, viewPortProps, ...props }) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport
      {...viewPortProps}
      className={cn(
        'h-full w-full rounded-[inherit]',
        viewPortProps?.className
      )}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
)
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar: React.FC<
  React.ComponentPropsWithRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
> = ({ ref, className, orientation = 'vertical', ...props }) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
)
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
