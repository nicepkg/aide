import * as React from 'react'
import { cn } from '@webview/utils/common'

import { Textarea } from '../ui/textarea'

interface ChatInputProps {
  className?: string
  value?: string
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, value, onKeyDown, onChange, placeholder, ...props }, ref) => (
    <Textarea
      autoComplete="off"
      value={value}
      ref={ref}
      onKeyDown={onKeyDown}
      onChange={onChange}
      name="message"
      placeholder={placeholder}
      className={cn(
        'max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none',
        className
      )}
      {...props}
    />
  )
)
ChatInput.displayName = 'ChatInput'

export { ChatInput }
