/* eslint-disable func-names */
const isPlainObject = (item: any): item is object =>
  item !== null &&
  typeof item === 'object' &&
  Object.prototype.toString.call(item) === '[object Object]' &&
  typeof item.constructor === 'function'

const isAsyncFunction = (func: Function): boolean =>
  func.constructor.name === 'AsyncFunction'

const mergeFunctions = (func1: Function, func2: Function): Function => {
  const isAsync1 = isAsyncFunction(func1)
  const isAsync2 = isAsyncFunction(func2)

  if (isAsync1 || isAsync2) {
    return async function (this: any, ...args: any[]) {
      const result1 = isAsync1
        ? await func1.apply(this, args)
        : func1.apply(this, args)
      const result2 = isAsync2
        ? await func2.apply(this, args)
        : func2.apply(this, args)
      return deepMergeProviders([result1, result2])
    }
  }
  return function (this: any, ...args: any[]) {
    const result1 = func1.apply(this, args)
    const result2 = func2.apply(this, args)
    return deepMergeProviders([result1, result2])
  }
}

const getAllProperties = (obj: any): string[] => {
  if (isPlainObject(obj) && obj.constructor.name !== 'Object') {
    const props = new Set<string>()

    const addProps = (currentObj: any) => {
      if (currentObj === null || currentObj === Object.prototype) {
        return
      }
      Object.getOwnPropertyNames(currentObj).forEach(prop => {
        if (prop !== 'constructor') {
          props.add(prop)
        }
      })
      addProps(Object.getPrototypeOf(currentObj))
    }

    addProps(obj)
    return Array.from(props)
  }
  return Object.keys(obj)
}

export const deepMergeProviders = <T>(objects: T[]): T => {
  if (objects.length === 0) {
    return {} as T
  }

  if (objects.length === 1) {
    return objects[0] as T
  }

  return objects.reduce((result, obj) => {
    if (isPlainObject(result) && isPlainObject(obj)) {
      getAllProperties(obj).forEach(key => {
        const value = (obj as any)[key]
        if (typeof value === 'function') {
          if (key in result && typeof (result as any)[key] === 'function') {
            ;(result as any)[key] = mergeFunctions((result as any)[key], value)
          } else {
            ;(result as any)[key] = value
          }
        } else if (isPlainObject(value)) {
          if (key in result) {
            ;(result as any)[key] = deepMergeProviders([
              (result as any)[key],
              value
            ])
          } else {
            ;(result as any)[key] = value
          }
        } else if (Array.isArray(value)) {
          if (key in result) {
            ;(result as any)[key] = [...(result as any)[key], ...value]
          } else {
            ;(result as any)[key] = value
          }
        } else if (typeof value === 'string') {
          if (key in result) {
            ;(result as any)[key] += value
          } else {
            ;(result as any)[key] = value
          }
        } else {
          ;(result as any)[key] = value
        }
      })
      return result
    }
    if (Array.isArray(result) && Array.isArray(obj)) {
      return [...result, ...obj] as unknown as T
    }
    if (typeof result === 'string' && typeof obj === 'string') {
      return (result + obj) as unknown as T
    }
    return obj
  }, {} as T)
}
