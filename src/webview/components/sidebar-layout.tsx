/* eslint-disable react/no-unstable-nested-components */
// src/webview/components/layout/sidebar-layout.tsx
import React, { type FC } from 'react'
import { TextAlignJustifyIcon } from '@radix-ui/react-icons'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button, type ButtonProps } from '@webview/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@webview/components/ui/sheet'
import { cn } from '@webview/utils/common'

interface SidebarLayoutProps {
  sidebar: React.ReactNode
  buildHeader: (SidebarHamburger: FC) => React.ReactNode
  children: React.ReactNode
  className?: string
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  sidebar,
  buildHeader,
  children,
  className
}) => {
  const SidebarHamburger = (props: ButtonProps) => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="iconXs" className="shrink-0" {...props}>
          <TextAlignJustifyIcon className="size-3" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[250px] sm:w-[300px] max-w-full">
        <VisuallyHidden>
          <SheetHeader>
            <SheetTitle />
            <SheetDescription />
          </SheetHeader>
        </VisuallyHidden>
        {sidebar}
      </SheetContent>
    </Sheet>
  )

  return (
    <div
      className={cn(
        'grid h-full w-full grid-flow-col grid-rows-[auto_1fr] md:grid-cols-[250px_1fr]',
        className
      )}
    >
      <div className="hidden md:block h-full p-4 border-r">{sidebar}</div>
      <div>
        <div className="md:hidden">{buildHeader(SidebarHamburger)}</div>
      </div>
      <div className="overflow-hidden flex-1 w-full flex flex-col justify-between lg:col-span-2">
        {children}
      </div>
    </div>
  )
}
