import { forwardRef } from 'react'
import type { TooltipContentProps } from '@radix-ui/react-tooltip'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@webview/components/ui/tooltip'

import { Button, type ButtonProps } from './ui/button'

export type ButtonWithTooltipProps = ButtonProps & {
  tooltip: string
  side?: TooltipContentProps['side']
}

export interface ButtonWithTooltipRef extends HTMLButtonElement {}

export const ButtonWithTooltip = forwardRef<
  ButtonWithTooltipRef,
  ButtonWithTooltipProps
>(({ children, tooltip, side = 'top', ...rest }, ref) => (
  <TooltipProvider>
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <Button ref={ref} {...rest}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent hideWhenDetached side={side}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
))
