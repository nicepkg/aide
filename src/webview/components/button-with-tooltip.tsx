import type { TooltipContentProps } from '@radix-ui/react-tooltip'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@webview/components/ui/tooltip'

import { Button, type ButtonProps } from './ui/button'

export interface ButtonWithTooltipRef extends HTMLButtonElement {}

export type ButtonWithTooltipProps = ButtonProps & {
  ref?: React.Ref<ButtonWithTooltipRef>
  tooltip: string
  side?: TooltipContentProps['side']
}

export const ButtonWithTooltip: React.FC<ButtonWithTooltipProps> = ({
  ref,
  children,
  tooltip,
  side = 'top',
  ...rest
}) => (
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
)
