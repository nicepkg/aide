import * as React from 'react'
import { cn } from '@webview/utils/common'

export interface TextareaProps
  extends React.ComponentPropsWithRef<'textarea'> {}

const Textarea: React.FC<TextareaProps> = ({ ref, className, ...props }) => (
  <textarea
    className={cn(
      'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-foreground/50 focus-visible:outline-none focus-visible:border focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
)

Textarea.displayName = 'Textarea'

export { Textarea }
