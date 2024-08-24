export interface FileUri {
  /**
   * @example '/Users/xxx/Documents/codes/aide/src/extension/file-utils/create-should-ignore.ts'
   */
  fsPath: string

  /**
   * @example 'file:///Users/xxx/Documents/codes/aide/src/extension/file-utils/create-should-ignore.ts'
   */
  external: string

  /**
   * @example '/Users/xxx/Documents/codes/aide/src/extension/file-utils/create-should-ignore.ts'
   */
  path: string

  /**
   * @example 'file'
   */
  scheme: string
}
