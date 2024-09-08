import React, { type ReactNode } from 'react'
import { cn } from '@webview/utils/common'

interface TruncateStartProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

export const TruncateStart: React.FC<TruncateStartProps> = ({
  children,
  className,
  style,
  ...props
}) => (
  <span
    className={cn(
      'overflow-hidden text-ellipsis text-xs text-foreground/50 whitespace-nowrap',
      className
    )}
    style={{ direction: 'rtl', ...style }}
    {...props}
  >
    {children}
  </span>
)
