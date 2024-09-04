import type { FC } from 'react'
import { ArchiveIcon } from '@radix-ui/react-icons'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'

export const ChatLeftBarHistories: FC = () => (
  <nav className="flex flex-col items-stretch gap-1 text-sm font-medium">
    <a
      href="#"
      className="bg-primary text-primary-foreground flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
    >
      New Chat
      <ButtonWithTooltip
        variant="ghost"
        className="hover:text-foreground/60 ml-auto h-auto p-0"
        tooltip="Archive"
      >
        <ArchiveIcon className="size-4" />
      </ButtonWithTooltip>
    </a>
  </nav>
)
