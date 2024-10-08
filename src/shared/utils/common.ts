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

export async function settledPromiseResults<T>(
  promises: Promise<T>[]
): Promise<T[]> {
  const results = await Promise.allSettled(promises)
  return results
    .map((result, index) => ({ result, index }))
    .filter(item => item.result.status === 'fulfilled')
    .sort((a, b) => a.index - b.index)
    .map(item => (item.result as PromiseFulfilledResult<T>).value)
}
