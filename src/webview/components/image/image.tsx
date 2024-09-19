import * as React from 'react'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { Skeleton } from '@webview/components/ui/skeleton'
import { cn } from '@webview/utils/common'
import { useTheme } from 'next-themes'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  isLoading?: boolean
  minSize?: number | string
  size?: number | string
  actions?: React.ReactNode
  alwaysShowActions?: boolean
  objectFit?: 'cover' | 'contain'
  preview?: boolean
  borderless?: boolean
}

export const Image: React.FC<
  ImageProps & { ref?: React.Ref<HTMLImageElement> }
> = ({
  className,
  src,
  alt,
  isLoading = false,
  minSize = 64,
  size = '100%',
  actions,
  alwaysShowActions = false,
  objectFit = 'cover',
  preview = true,
  borderless = false,
  ref,
  ...props
}) => {
  const { theme } = useTheme()
  const fallbackSrc =
    theme === 'dark'
      ? 'https://gw.alipayobjects.com/zos/kitchen/nhzBb%24r0Cm/image_off_dark.webp'
      : 'https://gw.alipayobjects.com/zos/kitchen/QAvkgt30Ys/image_off_light.webp'

  if (isLoading) {
    return (
      <Skeleton
        className={cn(
          'rounded-lg',
          typeof size === 'number'
            ? `w-[${size}px] h-[${size}px]`
            : `w-[${size}] h-[${size}]`,
          typeof minSize === 'number'
            ? `min-w-[${minSize}px] min-h-[${minSize}px]`
            : `min-w-[${minSize}] min-h-[${minSize}]`,
          className
        )}
      />
    )
  }

  return (
    <span
      className={cn(
        'relative block overflow-hidden rounded-lg',
        borderless
          ? 'shadow-[inset_0_0_0_1px_var(--border)]'
          : 'shadow-[0_0_0_1px_var(--border)]',
        typeof size === 'number'
          ? `max-w-[${size}px] max-h-[${size}px]`
          : `max-w-[${size}] max-h-[${size}]`,
        typeof minSize === 'number'
          ? `min-w-[${minSize}px] min-h-[${minSize}px]`
          : `min-w-[${minSize}] min-h-[${minSize}]`,
        'bg-muted cursor-pointer group',
        className
      )}
      {...props}
    >
      <img
        ref={ref}
        src={src || fallbackSrc}
        alt={alt}
        className={cn(
          'w-full h-auto object-cover',
          objectFit === 'contain' && 'object-contain'
        )}
      />
      {actions && (
        <span
          className={cn(
            'absolute block top-0 right-0 z-10',
            alwaysShowActions
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          {actions}
        </span>
      )}
      {preview && (
        <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <EyeOpenIcon className="w-6 h-6 text-white" />
        </span>
      )}
    </span>
  )
}

Image.displayName = 'Image'
