import chalk from 'chalk'

chalk.level = 3

export interface BaseLoggerOptions {
  name: string
  level?: string
  isDevLogger?: boolean
}

export abstract class BaseLogger {
  protected loggerName: string

  protected level: string

  protected isDevLogger: boolean

  protected logBuffer: string[] = []

  constructor(options: BaseLoggerOptions) {
    const { name, level = 'info', isDevLogger = false } = options
    this.loggerName = name
    this.level = level
    this.isDevLogger = isDevLogger
  }

  protected abstract isDev(): boolean
  protected abstract outputLog(message: string): void

  private getColoredLevel(level: string): string {
    switch (level) {
      case 'info':
        return chalk.green('INFO')
      case 'warn':
        return chalk.yellow('WARN')
      case 'error':
        return chalk.red('ERROR')
      case 'debug':
        return chalk.blue('DEBUG')
      default:
        return level.toUpperCase()
    }
  }

  private stringifyIfObject(value: any): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value)
    }
    return String(value)
  }

  private shouldLog(): boolean {
    return this.level !== 'silent' && (!this.isDevLogger || this.isDev())
  }

  protected formatLogMetadata(level: string): {
    coloredLevel: string
    dateTime: string
    loggerName: string
  } {
    const coloredLevel = this.getColoredLevel(level)
    const dateTime = new Date().toISOString().split('T')[1]?.split('.')[0]
    const loggerName = chalk.magenta(`[${this.loggerName}]`)
    return { coloredLevel, dateTime: `[${dateTime}]`, loggerName }
  }

  protected formatLogForSave(level: string, ...messages: any[]): string {
    const { coloredLevel, dateTime, loggerName } = this.formatLogMetadata(level)

    return `${loggerName} ${coloredLevel} ${chalk.green(dateTime)} ${messages
      .map(msg => this.stringifyIfObject(msg))
      .join(' ')}`
  }

  protected formatLogForConsoleLog(level: string, ...messages: any[]): any[] {
    const { coloredLevel, dateTime, loggerName } = this.formatLogMetadata(level)

    return [
      `${loggerName} ${coloredLevel} ${chalk.green(dateTime)}`,
      ...messages
    ]
  }

  private logMethod(level: string, ...messages: any[]): void {
    if (this.shouldLog()) {
      const formattedLogForSave = this.formatLogForSave(level, ...messages)
      const formattedLogForConsole = this.formatLogForConsoleLog(
        level,
        ...messages
      )

      // eslint-disable-next-line no-console
      console.log(...formattedLogForConsole)
      this.outputLog(formattedLogForSave)
      this.logBuffer.push(formattedLogForSave)

      // Keep only last 30 minutes of logs
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
      this.logBuffer = this.logBuffer.filter(log => {
        const timeStr = log.split('[')[1]?.split(']')[0]
        if (!timeStr) return false
        const logTime = new Date(`1970-01-01T${timeStr}Z`).getTime()
        return logTime >= thirtyMinutesAgo
      })
    }
  }

  log(...messages: any[]): void {
    this.logMethod('info', ...messages)
  }

  warn(...messages: any[]): void {
    this.logMethod('warn', ...messages)
  }

  error(...messages: any[]): void {
    this.logMethod('error', ...messages)
  }

  verbose(...messages: any[]): void {
    this.logMethod('debug', ...messages)
  }

  setLevel(level: string): void {
    this.level = level
  }

  get dev(): BaseLogger {
    if (this.isDevLogger) return this
    const DevLogger = this.constructor as new (
      options: BaseLoggerOptions
    ) => BaseLogger
    return new DevLogger({
      name: `${this.loggerName}:dev`,
      level: this.level,
      isDevLogger: true
    })
  }

  abstract saveLogsToFile(): Promise<void>
  abstract destroy(): void
}
