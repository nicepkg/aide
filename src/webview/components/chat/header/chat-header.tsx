import React from 'react'
import { PlusIcon, TextAlignJustifyIcon } from '@radix-ui/react-icons'
import { Button } from '@webview/components/ui/button'
import { cn } from '@webview/utils/common'

import { ButtonWithTooltip } from '../../button-with-tooltip'
import { ChatLeftBarSheet } from '../left-bar/chat-left-bar-sheet'

interface ChatHeaderProps extends React.HTMLAttributes<HTMLHeadElement> {}
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  className,
  ...props
}) => (
  <header
    className={cn(
      'chat-header px-3 py-1 flex-shrink-0 flex gap-2 text-foreground bg-background md:hidden',
      className
    )}
    {...props}
  >
    <ChatLeftBarSheet>
      <Button variant="ghost" size="iconXs" className="shrink-0">
        <TextAlignJustifyIcon className="size-3" />
      </Button>
    </ChatLeftBarSheet>
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
