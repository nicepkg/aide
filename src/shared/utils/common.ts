import { ZodError } from 'zod'

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const removeDuplicates = <T>(
  arr: T[],
  keys?: (keyof T)[] | ((item: T) => any),
  prioritySelector?: (a: T, b: T) => T
): T[] => {
  if (!keys) {
    return Array.from(new Set(arr))
  }

  const keyFn =
    typeof keys === 'function'
      ? keys
      : (item: T) => keys.map(k => item[k]).join('|')

  const uniqueMap = new Map<string, T>()

  for (const item of arr) {
    const key = keyFn(item)
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item)
    } else if (prioritySelector) {
      const existingItem = uniqueMap.get(key)!
      const priorityItem = prioritySelector(existingItem, item)
      uniqueMap.set(key, priorityItem)
    }
  }

  return Array.from(uniqueMap.values())
}

export const tryParseJSON = (jsonString: string) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    return null
  }
}

export const tryStringifyJSON = (obj: any) => {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    return null
  }
}

export const settledPromiseResults = async <T>(
  promises: Promise<T>[],
  onError?: (error: any) => void
): Promise<T[]> => {
  // eslint-disable-next-line no-console
  onError ||= err => console.debug('settledPromiseResults error:', err)
  const results = await Promise.allSettled(promises)

  return results
    .map((result, index) => ({ result, index }))
    .filter(item => {
      if (item.result.status === 'rejected' && onError) {
        onError((item.result as PromiseRejectedResult).reason)
      }
      return item.result.status === 'fulfilled'
    })
    .sort((a, b) => a.index - b.index)
    .map(item => (item.result as PromiseFulfilledResult<T>).value)
}

export const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

export const getErrorMsg = (err: any): string => {
  let errorMessage = String(err?.message || String(err) || '')

  if (err instanceof ZodError) {
    errorMessage = err.issues
      .map(issue => `${issue.path.join('.')} ${issue.message}`)
      .join(', ')
  }

  return errorMessage || 'An error occurred'
}

export const AbortError = new Error('AbortError')

export const isAbortError = (error: any) =>
  ['AbortError', 'Aborted'].includes(getErrorMsg(error))
