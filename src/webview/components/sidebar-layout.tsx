/* eslint-disable react/no-unstable-nested-components */
// src/webview/components/layout/sidebar-layout.tsx
import React, { useState } from 'react'
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

import { SidebarHeader } from './sidebar-header'

const SidebarHamburger = (
  props: ButtonProps & {
    open?: boolean
    setOpen?: (open: boolean) => void
    sidebar: React.ReactNode
  }
) => {
  const { open, setOpen, sidebar, ...otherProps } = props

  return (
    <Sheet open={open} defaultOpen={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="iconXs"
          className="shrink-0"
          {...otherProps}
        >
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
}

interface SidebarLayoutProps {
  title: string
  sidebar: React.ReactNode
  children: React.ReactNode
  className?: string
  headerLeft?: React.ReactNode
  showBackButton?: boolean
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  title,
  sidebar,
  children,
  className,
  headerLeft,
  showBackButton
}) => {
  const [openSidebar, setOpenSidebar] = useState(false)

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight">{title}</h2>
      {sidebar}
    </div>
  )

  return (
    <div className={cn('flex h-full w-full flex-col md:flex-row', className)}>
      <div className="hidden md:block w-[250px] h-full p-4 border-r overflow-y-auto">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 h-full">
        <div className="flex-shrink-0">
          <SidebarHeader
            title={title}
            showBackButton={showBackButton}
            headerLeft={
              <>
                <SidebarHamburger
                  className="md:hidden"
                  open={openSidebar}
                  setOpen={setOpenSidebar}
                  sidebar={<Sidebar />}
                />
                {headerLeft}
              </>
            }
          />
        </div>
        <div className="flex flex-1 flex-col overflow-auto">{children}</div>
      </div>
    </div>
  )
}
