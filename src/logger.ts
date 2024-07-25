import * as vscode from 'vscode'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const isServer = typeof window === 'undefined'

// Helper function to convert HSL to RGB
const hslToRgb = (
  h: number,
  s: number,
  l: number
): [number, number, number] => {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else if (h >= 300 && h < 360) {
    r = c
    g = 0
    b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return [r, g, b]
}

export interface LoggerOptions {
  vscodeOutputName: string
  label?: string
  enableDebug?: boolean
  logStorageFlagName?: string
}
/**
 * Logger class to log messages with a label and color
 * @example
 *  const logger = new Logger('MyComponent');
 *  logger.log('This is a log message');
 */
export class Logger {
  label: string | undefined

  color: string | undefined

  vscodeOutputChannel: vscode.OutputChannel

  private _enableDebug!: boolean

  protected get enableDebug() {
    if (this._enableDebug !== undefined) {
      return this._enableDebug
    }

    this._enableDebug = true
    return this._enableDebug
  }

  protected set enableDebug(value: boolean) {
    this._enableDebug = value
  }

  constructor(optionsOrLabel: LoggerOptions | string) {
    const options: LoggerOptions =
      (typeof optionsOrLabel === 'string'
        ? { label: optionsOrLabel, vscodeOutputName: optionsOrLabel }
        : optionsOrLabel) || {}

    const { enableDebug, label, vscodeOutputName } = options

    this.vscodeOutputChannel = vscode.window.createOutputChannel(
      vscodeOutputName,
      'log'
    )
    this.label = label
    this.color = this.calculateColor(label)
    this.enableDebug = enableDebug as boolean
  }

  private calculateColor = (label?: string): string | undefined => {
    if (!label) return undefined

    let hash = 0
    for (let i = 0; i < label.length; i++) {
      hash = (hash << 5) - hash + label.charCodeAt(i)
      hash |= 0 // Convert to 32bit integer
    }

    const hue = hash % 360
    const saturation = 50
    const lightness = 50

    if (isServer) {
      // For Node.js, return ANSI color code
      return `\x1b[38;2;${hslToRgb(hue, saturation, lightness).join(';')}m`
    }
    // For browser, return CSS color string
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  private getLabelWithColor = (): string => {
    if (isServer) {
      return `${this.color}[${this.label}]\x1b[0m`
    }
    return `[${this.label}]`
  }

  private formatDate(date: Date): string {
    return date.toISOString().replace('T', ' ').replace('Z', '')
  }

  private logToVscodeOutputChannel: typeof this.logWithColor = (
    method,
    ...args
  ) => {
    const level = method === 'log' ? 'info' : method
    const vscodeLogContent = [
      this.formatDate(new Date()),
      `[${level}]`,
      ...args
    ]
    this.vscodeOutputChannel.appendLine(
      vscodeLogContent
        .map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(' ')
    )
  }

  private logToConsole: typeof this.logWithColor = (method, ...args) => {
    if (!this.label) {
      ;(console as any)[method](...args)
      return
    }

    const labelWithColor = this.getLabelWithColor()
    const logArgs = [labelWithColor, ...args]

    if (isServer) {
      ;(console as any)[method](...logArgs)
    } else {
      ;(console as any)[method](
        `%c${labelWithColor}`,
        `color: ${this.color}`,
        ...args
      )
    }
  }

  private logWithColor = (
    method: 'log' | 'warn' | 'error' | 'debug',
    ...args: any[]
  ) => {
    this.logToVscodeOutputChannel(method, ...args)
    this.logToConsole(method, ...args)
  }

  // Check if logging should occur
  shouldLog = () => this.enableDebug

  // Enable logging
  enable = () => {
    this.enableDebug = true
  }

  // Disable logging
  disable = () => {
    this.enableDebug = false
  }

  log = (...args: any[]) => {
    if (!this.shouldLog()) return
    this.logWithColor('log', ...args)
  }

  warn = (...args: any[]) => {
    if (!this.shouldLog()) return
    this.logWithColor('warn', ...args)
  }

  error = (...args: any[]) => {
    if (!this.shouldLog()) return
    this.logWithColor('error', ...args)
  }

  verbose = (...args: any[]) => {
    if (!this.shouldLog()) return
    this.logWithColor('debug', ...args)
  }
}

export const logger = new Logger('Aide')
