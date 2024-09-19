import * as React from 'react'
import { cn } from '@webview/utils/common'
import { cva, type VariantProps } from 'class-variance-authority'

export const linkVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-foreground hover:text-foreground/80',
        underline: 'underline-offset-4 hover:underline text-foreground'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href: string
  asChild?: boolean
  children?: React.ReactNode
}

export const Link: React.FC<React.ComponentPropsWithRef<'a'> & LinkProps> = ({
  ref,
  className,
  variant,
  href,
  target,
  children,
  ...props
}) => {
  const isNewWindow = href?.startsWith('http')
  return (
    <a
      className={cn(linkVariants({ variant, className }))}
      ref={ref}
      href={href}
      target={target || isNewWindow ? '_blank' : undefined}
      rel={isNewWindow ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  )
}
Link.displayName = 'Link'
