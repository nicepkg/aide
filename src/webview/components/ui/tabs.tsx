import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@webview/utils/common'
import { cva, type VariantProps } from 'class-variance-authority'

const Tabs = TabsPrimitive.Root

const tabListVariants = cva(
  'inline-flex items-center justify-center bg-muted text-muted-foreground rounded-lg p-1',
  {
    variants: {
      mode: {
        default: '',
        underlined:
          'w-full justify-start rounded-none border-b text-foreground bg-transparent p-0'
      }
    },
    defaultVariants: {
      mode: 'default'
    }
  }
)

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow px-3 py-1 rounded-md',
  {
    variants: {
      mode: {
        default: '',
        underlined:
          'relative text-md h-full rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-1 pt-1 font-semibold text-foreground/60 shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-none'
      }
    },
    defaultVariants: {
      mode: 'default'
    }
  }
)

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabListVariants>
>(({ className, mode, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabListVariants({ className, mode }))}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabsTriggerVariants>
>(({ className, mode, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ className, mode }))}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
