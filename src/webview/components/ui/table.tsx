import * as React from 'react'
import { cn } from '@webview/utils/common'

const Table: React.FC<React.ComponentPropsWithRef<'table'>> = ({
  ref,
  className,
  ...props
}) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
)
Table.displayName = 'Table'

const TableHeader: React.FC<React.ComponentPropsWithRef<'thead'>> = ({
  ref,
  className,
  ...props
}) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
)
TableHeader.displayName = 'TableHeader'

const TableBody: React.FC<React.ComponentPropsWithRef<'tbody'>> = ({
  ref,
  className,
  ...props
}) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
)
TableBody.displayName = 'TableBody'

const TableFooter: React.FC<React.ComponentPropsWithRef<'tfoot'>> = ({
  ref,
  className,
  ...props
}) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
)
TableFooter.displayName = 'TableFooter'

const TableRow: React.FC<React.ComponentPropsWithRef<'tr'>> = ({
  ref,
  className,
  ...props
}) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
)
TableRow.displayName = 'TableRow'

const TableHead: React.FC<React.ComponentPropsWithRef<'th'>> = ({
  ref,
  className,
  ...props
}) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className
    )}
    {...props}
  />
)
TableHead.displayName = 'TableHead'

const TableCell: React.FC<React.ComponentPropsWithRef<'td'>> = ({
  ref,
  className,
  ...props
}) => (
  <td
    ref={ref}
    className={cn(
      'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className
    )}
    {...props}
  />
)
TableCell.displayName = 'TableCell'

const TableCaption: React.FC<React.ComponentPropsWithRef<'caption'>> = ({
  ref,
  className,
  ...props
}) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
)
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
}
