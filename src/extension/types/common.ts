export type LocalizeFunction = (key: string, ...args: any[]) => string

export interface Messages {
  [key: string]: string
}

export type MaybePromise<T> = T | Promise<T>
