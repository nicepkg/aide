import React, { useId } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@webview/utils/common'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'

const TRANSITION = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.4
}

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

interface PopoverContentProps
  extends React.ComponentPropsWithRef<typeof PopoverPrimitive.Content> {
  withBlur?: boolean
  blurClassName?: string
}

const PopoverContent: React.FC<PopoverContentProps> = ({
  ref,
  className,
  align = 'center',
  sideOffset = 4,
  children,
  withBlur = false,
  blurClassName,
  ...props
}) => {
  const uniqueId = useId()

  return (
    <MotionConfig transition={TRANSITION}>
      <PopoverPrimitive.Portal>
        <AnimatePresence>
          {withBlur && (
            <motion.div
              key="blur"
              initial={{ backdropFilter: 'blur(0px)' }}
              animate={{ backdropFilter: 'blur(4px)' }}
              exit={{ backdropFilter: 'blur(0px)' }}
              className={cn('fixed inset-0 z-40', blurClassName)}
            />
          )}
          <PopoverPrimitive.Content
            ref={ref}
            key="content"
            align={align}
            sideOffset={sideOffset}
            className={cn(
              'z-50 w-72 overflow-x-hidden rounded-md shadow-md border bg-popover p-4 text-popover-foreground outline-none',
              className
            )}
            onFocusOutside={e => e.preventDefault()}
            {...props}
          >
            <motion.div
              key="content"
              layoutId={`popover-${uniqueId}`}
              className="w-full"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
            >
              {children}
            </motion.div>
          </PopoverPrimitive.Content>
        </AnimatePresence>
      </PopoverPrimitive.Portal>
    </MotionConfig>
  )
}
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
