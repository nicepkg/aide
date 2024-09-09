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

export const removeDuplicates = <T>(
  arr: T[],
  keys?: (keyof T)[] | ((item: T) => any)
): T[] => {
  if (!keys) {
    return Array.from(new Set(arr))
  }

  const keyFn =
    typeof keys === 'function'
      ? keys
      : (item: T) => keys.map(k => item[k]).join('|')

  const seen = new Set<string>()
  return arr.filter(item => {
    const key = keyFn(item)
    return seen.has(key) ? false : seen.add(key)
  })
}
