import * as React from 'react'
import { cn } from '@webview/utils/common'
import { cva, type VariantProps } from 'class-variance-authority'

import { ChatMessageLoading } from './chat-message-loading'

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, children, ...props }, ref) => (
    <div
      className={cn(
        'flex relative max-w-full w-full items-center mb-2',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
)
ChatBubble.displayName = 'ChatBubble'

// ChatBubbleMessage
export const chatBubbleMessageVariants = cva('px-4 py-2', {
  variants: {
    variant: {
      received: 'bg-background text-foreground w-full',
      sent: 'bg-background text-foreground border ml-auto mr-4 rounded-tl-lg rounded-bl-lg rounded-tr-lg'
    },
    layout: {
      default: '',
      ai: 'w-full rounded-none bg-muted'
    }
  },
  defaultVariants: {
    variant: 'received',
    layout: 'default'
  }
})

interface ChatBubbleMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleMessageVariants> {
  isLoading?: boolean
}

export const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(
  (
    { className, variant, layout, isLoading = false, children, ...props },
    ref
  ) => (
    <>
      {variant === 'sent' && <div className="w-4 shrink-0" />}
      <div
        className={cn(
          chatBubbleMessageVariants({ variant, layout, className })
        )}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <ChatMessageLoading />
          </div>
        ) : (
          children
        )}
      </div>
    </>
  )
)
ChatBubbleMessage.displayName = 'ChatBubbleMessage'

// ChatBubbleTimestamp
interface ChatBubbleTimestampProps
  extends React.HTMLAttributes<HTMLDivElement> {
  timestamp: string
}

export const ChatBubbleTimestamp: React.FC<ChatBubbleTimestampProps> = ({
  timestamp,
  className,
  ...props
}) => (
  <div className={cn('text-xs mt-2 text-right', className)} {...props}>
    {timestamp}
  </div>
)
