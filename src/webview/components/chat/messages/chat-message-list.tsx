import * as React from 'react'
import { cn } from '@webview/utils/common'

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ChatMessageList = React.forwardRef<
  HTMLDivElement,
  ChatMessageListProps
>(({ className, children, ...props }, ref) => (
  <div
    className={cn('flex flex-col w-full overflow-y-auto', className)}
    ref={ref}
    {...props}
  >
    {children}
  </div>
))

ChatMessageList.displayName = 'ChatMessageList'
