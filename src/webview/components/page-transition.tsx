import { ReactNode, type FC } from 'react'
import { motion, type Variants } from 'framer-motion'

export type PageTransitionDirection = 'forward' | 'backward'
interface PageTransitionProps {
  children: ReactNode
  pathname: string
  direction: PageTransitionDirection
}

export const PageTransition: FC<PageTransitionProps> = ({
  children,
  pathname,
  direction
}) => {
  const variants: Variants = {
    hidden: {
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 1
    },
    visible: {
      x: 0,
      opacity: 1
    },
    exit: {
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 1
    }
  }

  return (
    <motion.div
      key={pathname}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{
        type: 'linear',
        duration: 0.2
      }}
      className="flex-1 h-full w-full absolute origin-center"
      style={{ willChange: 'auto' }}
    >
      {children}
    </motion.div>
  )
}
