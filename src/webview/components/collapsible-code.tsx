import React, { ReactNode, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, CodeIcon } from '@radix-ui/react-icons'
import { Button } from '@webview/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'

export interface CollapsibleCodeProps {
  children: ReactNode
  title: ReactNode
  actions?: ReactNode
  defaultExpanded?: boolean
  isLoading?: boolean
  className?: string
}

export const CollapsibleCode: React.FC<CollapsibleCodeProps> = ({
  children,
  title,
  actions,
  defaultExpanded = false,
  isLoading,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={`relative overflow-hidden rounded-md border ${className}`}>
      <div className="h-8 flex items-center justify-between px-2 text-xs">
        <div
          className="flex h-full items-center flex-1 gap-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {typeof title === 'string' ? <CodeIcon className="size-3" /> : null}
          <span className="font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <Button
            className="transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
            size="iconXss"
            variant="ghost"
            aria-label={isExpanded ? 'Collapse code' : 'Expand code'}
          >
            {isExpanded ? (
              <ChevronUpIcon className="size-3" />
            ) : (
              <ChevronDownIcon className="size-3" />
            )}
          </Button>

          {isLoading && (
            <Button
              className="transition-colors"
              size="iconXss"
              variant="ghost"
              aria-label="loading"
              disabled
            >
              <div className="size-3 border-2 rounded-full animate-spin border-t-primary" />
            </Button>
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        <motion.div
          initial="collapsed"
          animate={isExpanded ? 'expanded' : 'collapsed'}
          exit="collapsed"
          variants={{
            expanded: { opacity: 1, height: 'auto' },
            collapsed: { opacity: 0, height: 0 }
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
          style={{ willChange: 'auto' }}
        >
          <div className="text-xs p-2">{children}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
