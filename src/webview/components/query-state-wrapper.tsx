import type { FC, ReactNode } from 'react'
import {
  ExclamationTriangleIcon,
  ReloadIcon,
  ShadowNoneIcon
} from '@radix-ui/react-icons'
import { cn } from '@webview/utils/common'

import { LoadingSpinner } from './loading-spinner'
import { Button } from './ui/button'

interface QueryStateWrapperProps {
  children: ReactNode
  isLoading?: boolean
  error?: Error | null
  isEmpty?: boolean
  refetch?: () => void
  emptyMessage?: string
  className?: string
}

export const QueryStateWrapper: FC<QueryStateWrapperProps> = ({
  children,
  isLoading,
  error,
  isEmpty,
  refetch,
  emptyMessage = 'No data available',
  className
}) => {
  if (error) {
    return (
      <div className="flex w-full h-full min-h-[200px] flex-col items-center justify-center gap-6 rounded-lg border border-destructive/30 bg-destructive/5 p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-destructive" />
          <div className="space-y-1">
            <h3 className="font-semibold text-destructive">Error occurred</h3>
            <p className="text-sm text-destructive/80">{error.message}</p>
          </div>
        </div>
        {refetch && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <ReloadIcon className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    )
  }

  if (!isLoading && isEmpty) {
    return (
      <div className="flex w-full h-full min-h-[200px] flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/5 p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <ShadowNoneIcon className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
        {refetch && (
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <ReloadIcon className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-[1px]">
          <LoadingSpinner className="h-8 w-8 text-primary" />
        </div>
      )}
    </div>
  )
}
