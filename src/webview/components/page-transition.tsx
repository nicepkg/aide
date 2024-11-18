import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: ReactNode
  pathname: string
}

export function PageTransition({ children, pathname }: PageTransitionProps) {
  return (
    <motion.div
      key={pathname}
      initial={{
        opacity: 0,
        scale: 0.98,
        y: 10
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: {
          duration: 0.3
        }
      }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 25,
        opacity: { duration: 0.3 }
      }}
      className="flex-1 h-full w-full absolute origin-center"
    >
      {children}
    </motion.div>
  )
}
