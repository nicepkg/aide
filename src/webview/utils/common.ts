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

export const unsecuredCopyToClipboard = (text: string) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  Object.assign(textArea.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    opacity: '0',
    width: '0',
    height: '0',
    pointerEvents: 'none'
  })

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    document.execCommand('copy')
  } catch (err) {
    throw new Error(`Unable to copy to clipboard${err}`)
  }
  document.body.removeChild(textArea)
}

export const copyToClipboard = async (content: string) => {
  if (window.isSecureContext && navigator.clipboard)
    await navigator.clipboard.writeText(content)
  else unsecuredCopyToClipboard(content)
}
