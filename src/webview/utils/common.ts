import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ZodError } from 'zod'

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
