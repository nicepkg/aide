import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@webview/utils/common'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform
} from 'framer-motion'

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

interface AnimatedTooltipProps
  extends React.ComponentPropsWithRef<typeof TooltipPrimitive.Content> {
  animated?: boolean
}

const tooltipContentStyles =
  'overflow-hidden rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'

const TooltipContent: React.FC<AnimatedTooltipProps> = ({
  ref,
  className,
  sideOffset = 4,
  animated = true,
  ...props
}) => {
  const x = useMotionValue(0)
  const springConfig = { stiffness: 100, damping: 5 }
  const rotate = useSpring(useTransform(x, [-100, 100], [-3, 3]), springConfig)

  React.useEffect(() => {
    if (animated) {
      // Random rotation between -100 and 100
      const randomRotation = Math.random() * 200 - 100
      x.set(randomRotation)
    }
  }, [animated, x])

  return (
    <AnimatePresence initial={false}>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className="z-50"
        {...props}
      >
        {animated ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 260,
                damping: 10
              }
            }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            style={{ rotate }}
            className={cn(tooltipContentStyles, className)}
          >
            {props.children}
          </motion.div>
        ) : (
          <div className={cn(tooltipContentStyles, className)}>
            {props.children}
          </div>
        )}
      </TooltipPrimitive.Content>
    </AnimatePresence>
  )
}

TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
