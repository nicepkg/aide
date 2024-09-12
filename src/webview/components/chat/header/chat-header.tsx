import React from 'react'
import { PlusIcon } from '@radix-ui/react-icons'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import { cn } from '@webview/utils/common'

interface ChatHeaderProps extends React.HTMLAttributes<HTMLHeadElement> {
  headerLeft?: React.ReactNode
}
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  className,
  headerLeft,
  ...props
}) => (
  <header
    className={cn(
      'chat-header px-3 py-1 flex-shrink-0 flex gap-2 text-foreground bg-background md:hidden',
      className
    )}
    {...props}
  >
    {headerLeft}
    <ButtonWithTooltip
      variant="ghost"
      size="iconXs"
      tooltip="New Chat"
      side="bottom"
      className="shrink-0"
    >
      <PlusIcon className="size-3" />
    </ButtonWithTooltip>
  </header>
)
