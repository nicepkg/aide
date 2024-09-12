import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@webview/utils/common'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground border hover:border-transparent hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:border-transparent hover:bg-destructive/90',
        outline:
          'border hover:border-transparent bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground border hover:border-transparent hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2',
        xsss: 'h-5 px-1 py-0.5 text-xs rounded-sm',
        xss: 'h-5 px-2 py-0.5 text-xs rounded-sm',
        iconXss: 'size-5 py-0.5 py-0.5 text-xs rounded-sm',
        xs: 'h-6 px-2 py-1 text-xs rounded-sm',
        iconXs: 'size-6 py-1 text-xs rounded-sm',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button: React.FC<
  ButtonProps & { ref?: React.Ref<HTMLButtonElement> }
> = ({ className, variant, size, asChild = false, ref, ...props }) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}
Button.displayName = 'Button'

export { Button, buttonVariants }
