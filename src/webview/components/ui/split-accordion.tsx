import * as React from 'react'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { cn } from '@webview/utils/common'
import { AnimatePresence, motion } from 'framer-motion'

import { Button, type ButtonProps } from './button'

type SplitAccordionContextValue = {
  value?: string
  onValueChange: (value: string | undefined) => void
}

const SplitAccordionContext = React.createContext<
  SplitAccordionContextValue | undefined
>(undefined)

interface SplitAccordionProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string | undefined) => void
  children: React.ReactNode
  className?: string
}

export const SplitAccordion: React.FC<SplitAccordionProps> = ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className
}) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    string | undefined
  >(defaultValue)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = React.useCallback(
    (newValue: string | undefined) => {
      if (!isControlled) {
        setUncontrolledValue(newValue)
      }
      onValueChange?.(newValue)
    },
    [isControlled, onValueChange]
  )

  return (
    <SplitAccordionContext.Provider
      value={{ value, onValueChange: handleValueChange }}
    >
      <div className={cn('flex flex-col w-full', className)}>{children}</div>
    </SplitAccordionContext.Provider>
  )
}

interface SplitAccordionTriggerProps extends ButtonProps {
  value: string
  iconClassName?: string
}

export const SplitAccordionTrigger: React.FC<SplitAccordionTriggerProps> = ({
  value: triggerValue,
  children,
  className,
  iconClassName,
  ...rest
}) => {
  const context = React.useContext(SplitAccordionContext)
  if (!context)
    throw new Error('SplitAccordionTrigger must be used within SplitAccordion')

  const isActive = context.value === triggerValue

  return (
    <Button
      {...rest}
      onClick={() => context.onValueChange(isActive ? undefined : triggerValue)}
      className={cn('w-fit justify-between gap-1 relative', className)}
    >
      {children}
      <motion.span
        animate={{ rotate: isActive ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDownIcon className={cn('size-4', iconClassName)} />
      </motion.span>
    </Button>
  )
}

interface SplitAccordionContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const SplitAccordionContent: React.FC<SplitAccordionContentProps> = ({
  value: contentValue,
  children,
  className
}) => {
  const context = React.useContext(SplitAccordionContext)
  if (!context)
    throw new Error('SplitAccordionContent must be used within SplitAccordion')

  const isActive = context.value === contentValue

  return (
    <AnimatePresence initial={false}>
      {isActive && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn('overflow-hidden w-full', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
