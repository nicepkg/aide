import React, { Children, ReactElement } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface AnimatedListProps {
  className?: string
  children: React.ReactNode
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  className,
  children
}) => (
  <div className={`flex flex-col items-center gap-4 ${className}`}>
    <AnimatePresence initial={false}>
      {Children.map(children, child => (
        <AnimatedListItem key={(child as ReactElement).key}>
          {child}
        </AnimatedListItem>
      ))}
    </AnimatePresence>
  </div>
)

AnimatedList.displayName = 'AnimatedList'

interface AnimatedListItemProps {
  children: React.ReactNode
}

export const AnimatedListItem = ({ children }: AnimatedListItemProps) => {
  const animations = {
    initial: {
      opacity: 0,
      y: 50,
      scale: 0.9
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        mass: 0.8,
        delay: 0.1
      }
    }
  }

  return (
    <motion.div {...animations} layout={false} className="mx-auto w-full">
      {children}
    </motion.div>
  )
}
