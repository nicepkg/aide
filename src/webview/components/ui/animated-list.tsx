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
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      originY: 0
    },
    exit: {
      scale: 0,
      opacity: 0
    },
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 40
    }
  }

  return (
    <motion.div {...animations} layout={false} className="mx-auto w-full">
      {children}
    </motion.div>
  )
}
