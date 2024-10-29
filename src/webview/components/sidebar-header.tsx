import React from 'react'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import { cn } from '@webview/utils/common'
import { useLocation, useNavigate } from 'react-router'

export interface SidebarHeaderProps
  extends React.HTMLAttributes<HTMLHeadElement> {
  title: string
  headerLeft?: React.ReactNode
  headerRight?: React.ReactNode
  showBackButton?: boolean
}
export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  className,
  title,
  headerLeft,
  headerRight,
  showBackButton,
  ...props
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const canGoBack = () => location.key !== 'default'

  const handleGoBack = () => {
    if (canGoBack()) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <header
      className={cn(
        'sidebar-header overflow-hidden px-3 py-1 flex flex-shrink-0 items-center justify-between text-foreground bg-background',
        className
      )}
      {...props}
    >
      <div className="flex flex-shrink-0 items-center">
        {(showBackButton ?? canGoBack()) ? (
          <ButtonWithTooltip
            variant="ghost"
            size="iconXs"
            tooltip="Go Back"
            side="bottom"
            className="shrink-0"
            onClick={handleGoBack}
          >
            <ArrowLeftIcon className="size-3" />
          </ButtonWithTooltip>
        ) : null}
        {headerLeft}
      </div>

      <div className="flex flex-shrink-0 items-center pr-1">
        {headerRight}
        <h1 className="flex-1 text-md font-semibold text-center select-none">
          {title}
        </h1>
      </div>
    </header>
  )
}
