export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

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
