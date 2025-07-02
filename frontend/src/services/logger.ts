export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger {
  private static instance: Logger
  private logLevel: LogLevel = LogLevel.INFO

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  error(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }
}

export const logger = Logger.getInstance()
