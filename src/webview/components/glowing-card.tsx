import * as React from 'react'
import { cn } from '@webview/utils/common'

interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  isAnimated?: boolean
  animationDuration?: number
  blurAmount?: number
}

export const GlowingCard = React.forwardRef<HTMLDivElement, GlowingCardProps>(
  (
    {
      children,
      isAnimated = true,
      animationDuration = 0.8,
      blurAmount = 8,
      className,
      ...props
    },
    ref
  ) => {
    const glowingCardClass = cn(
      'absolute w-full h-full z-50',
      'opacity-75',
      isAnimated ? 'animate-rotating' : 'hidden'
    )

    const rotatingKeyframes = `
      @property --glowingCardRotateAngle {
        syntax: '<angle>';
        inherits: false;
        initial-value: 0deg;
      }

      @keyframes rotating {
        0% { --glowingCardRotateAngle: 0deg; }
        100% { --glowingCardRotateAngle: 360deg; }
      }
    `

    const glowingCardStyle = `
      .glowing-card {
        background: repeating-conic-gradient(from var(--glowingCardRotateAngle), #0f0, #ff0, #0ff, #f0f, #0ff);
        filter: blur(${blurAmount}px);
      }
      .animate-rotating {
        animation: rotating ${animationDuration}s linear infinite;
      }
    `

    return (
      <div
        ref={ref}
        className={cn('relative overflow-hidden', className)}
        {...props}
      >
        <style>{rotatingKeyframes + glowingCardStyle}</style>
        <div
          className={cn(glowingCardClass, 'glowing-card', 'top-[calc(-100%)]')}
        />
        <div
          className={cn(
            glowingCardClass,
            'glowing-card',
            'bottom-[calc(-100%)]'
          )}
        />
        <div
          className={cn(glowingCardClass, 'glowing-card', 'left-[calc(-100%)]')}
          style={{ animationDelay: `${animationDuration / 2}s` }}
        />
        <div
          className={cn(
            glowingCardClass,
            'glowing-card',
            'right-[calc(-100%)]'
          )}
          style={{ animationDelay: `${animationDuration / 2}s` }}
        />
        <div className="h-full overflow-auto">{children}</div>
      </div>
    )
  }
)

GlowingCard.displayName = 'GlowingCard'
