export type LocalizeFunction = (key: string, ...args: any[]) => string

export interface Messages {
  [key: string]: string
}
