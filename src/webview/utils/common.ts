import { getErrorMsg } from '@shared/utils/common'
import { clsx, type ClassValue } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

import { logger } from './logger'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const logAndToastError = (message: string, error?: any) => {
  logger.error(message, error)
  toast.error(error ? `${message}: ${getErrorMsg(error)}` : message)
}
