import type { FC } from 'react'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@webview/components/ui/sheet'

import { ChatLeftBarHistories } from './chat-left-bar-histories'

export interface ChatLeftBarSheetProps {
  children: React.ReactNode
}
export const ChatLeftBarSheet: FC<ChatLeftBarSheetProps> = ({ children }) => (
  <Sheet>
    <SheetTrigger asChild>{children}</SheetTrigger>
    <SheetContent side="left" className="flex flex-col">
      <VisuallyHidden.Root>
        <SheetHeader>
          <SheetTitle>Chat histories</SheetTitle>
          <SheetDescription>Chat histories</SheetDescription>
        </SheetHeader>
      </VisuallyHidden.Root>
      <div className="flex flex-col gap-1">
        <ChatLeftBarHistories />
      </div>
    </SheetContent>
  </Sheet>
)
