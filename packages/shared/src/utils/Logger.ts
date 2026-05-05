/**
 * @file packages/shared/src/utils/Logger.ts
 * @description Centralized logging utility with level support.
 *              Lightweight and production-ready.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  constructor() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel && envLevel in LogLevel) {
      this.level = LogLevel[envLevel as keyof typeof LogLevel] as unknown as LogLevel;
    }
  }

  private formatMessage(level: string, message: string, context?: string): string {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const ctx = context ? ` [${context.toUpperCase()}]` : '';
    const icon = this.getIcon(level);
    return `${icon} ${timestamp}${ctx}: ${message}`;
  }

  private getIcon(level: string): string {
    switch (level) {
      case 'DEBUG': return '🔍';
      case 'INFO': return 'ℹ️';
      case 'WARN': return '⚠️';
      case 'ERROR': return '❌';
      default: return '📝';
    }
  }

  debug(message: string, context?: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message, context), ...args);
    }
  }

  info(message: string, context?: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.info(this.formatMessage('INFO', message, context), ...args);
    }
  }

  warn(message: string, context?: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, context), ...args);
    }
  }

  error(message: string, context?: string, error?: any, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message, context), ...args);
      if (error) {
        if (error instanceof Error) {
          console.error(`   └─ Error: ${error.message}`);
          if (error.stack && this.level === LogLevel.DEBUG) {
            console.error(error.stack);
          }
        } else {
          console.error('   └─ Detail:', error);
        }
      }
    }
  }
}

export const logger = new Logger();
