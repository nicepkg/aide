import { clsx, type ClassValue } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { ZodError } from 'zod'

import { logger } from './logger'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const getErrorMsg = (error: any) => {
  let errorMessage = String(error?.message || String(error) || '')

  if (error instanceof ZodError) {
    errorMessage = error.issues
      .map(issue => `${issue.path.join('.')} ${issue.message}`)
      .join(', ')
  }

  return errorMessage
}

export const logAndToastError = (message: string, error?: any) => {
  logger.error(message, error)
  toast.error(error ? `${message}: ${getErrorMsg(error)}` : message)
}
