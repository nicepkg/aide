import * as React from 'react'
import { PlayIcon } from '@radix-ui/react-icons'
import { cn } from '@webview/utils/common'

import { Skeleton } from './ui/skeleton'

export interface VideoProps extends React.HTMLAttributes<HTMLDivElement> {
  autoplay?: boolean
  borderless?: boolean
  classNames?: {
    video?: string
    wrapper?: string
  }
  height?: number | string
  isLoading?: boolean
  loop?: boolean
  minSize?: number | string
  muted?: HTMLVideoElement['muted']
  onload?: HTMLVideoElement['onload']
  poster?: string
  preload?: HTMLVideoElement['preload']
  preview?: boolean
  size?: number | string
  src: string
  width?: number | string
}

export const Video: React.FC<
  VideoProps & { ref?: React.ForwardedRef<HTMLDivElement> }
> = ({
  ref,
  preload = 'auto',
  src,
  style,
  classNames,
  className,
  minSize,
  size = '100%',
  width,
  height,
  onMouseEnter,
  onMouseLeave,
  preview = true,
  isLoading,
  borderless,
  ...props
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [showControls, setShowControls] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const onVideoMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    setShowControls(true)
    onMouseEnter?.(e as any)
  }

  const onVideoMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    setShowControls(false)
    onMouseLeave?.(e as any)
  }

  const handlePlayIconClick = () => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  if (isLoading) {
    return (
      <Skeleton
        className={cn('rounded-lg', {
          'max-w-[100%] max-h-[100%]': size === '100%',
          [`w-[${size}px] h-[${size}px]`]: typeof size === 'number',
          [`min-w-[${minSize}px] min-h-[${minSize}px]`]:
            typeof minSize === 'number'
        })}
        style={{
          width,
          height
        }}
      />
    )
  }

  return (
    <span
      ref={ref}
      className={cn(
        'relative block overflow-hidden rounded-lg',
        'mb-4',
        {
          'shadow-[inset_0_0_0_1px_var(--border)]': !borderless,
          'shadow-[0_0_0_1px_var(--border)]': borderless,
          'max-w-[100%] max-h-[100%]': size === '100%',
          [`w-[${size}px] h-[${size}px]`]: typeof size === 'number',
          [`min-w-[${minSize}px] min-h-[${minSize}px]`]:
            typeof minSize === 'number'
        },
        classNames?.wrapper,
        className
      )}
      style={{
        ...style,
        background: 'var(--muted)'
      }}
      {...props}
    >
      {preview && !isPlaying && (
        <span
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 opacity-0 transition-opacity duration-300 hover:opacity-100"
          onClick={handlePlayIconClick}
        >
          <PlayIcon className="h-12 w-12 text-foreground cursor-pointer" />
        </span>
      )}
      <video
        ref={videoRef}
        className={cn('cursor-pointer w-full h-auto', classNames?.video)}
        controls={showControls}
        height={height}
        muted
        onEnded={() => setIsPlaying(false)}
        onMouseEnter={onVideoMouseEnter}
        onMouseLeave={onVideoMouseLeave}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPlaying={() => setIsPlaying(true)}
        preload={preload}
        style={{
          width: '100%',
          height: 'auto'
        }}
        width={width}
      >
        <source src={src} />
      </video>
    </span>
  )
}

Video.displayName = 'Video'
