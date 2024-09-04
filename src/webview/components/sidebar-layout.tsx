// src/webview/components/layout/sidebar-layout.tsx
import React from 'react'
import { TextAlignJustifyIcon } from '@radix-ui/react-icons'
import { Button } from '@webview/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@webview/components/ui/sheet'
import { cn } from '@webview/utils/common'

interface SidebarLayoutProps {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  sidebar,
  header,
  children,
  className
}) => (
  <div
    className={cn(
      'grid h-full w-full grid-flow-col grid-rows-[auto_1fr] md:grid-cols-[250px_1fr]',
      className
    )}
  >
    <div className="hidden md:block">{sidebar}</div>
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="iconXs" className="shrink-0">
            <TextAlignJustifyIcon className="size-3" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] sm:w-[300px]">
          {sidebar}
        </SheetContent>
      </Sheet>
    </div>
    <div>{header}</div>
    <div className="overflow-hidden flex-1 w-full flex flex-col justify-between lg:col-span-2">
      {children}
    </div>
  </div>
)
