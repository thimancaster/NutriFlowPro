
/**
 * Logger utility for consistent logging throughout the application
 * Automatically disables debug logs in production environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  enabledInProduction: boolean;
}

class Logger {
  private options: LoggerOptions;

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = {
      enabledInProduction: false,
      ...options
    };
  }

  /**
   * Debug logs - disabled in production
   */
  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Info logs - important information that can be shown in production
   */
  info(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production' || this.options.enabledInProduction) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Warning logs - potential issues that should be addressed
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  /**
   * Error logs - always shown in all environments
   */
  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }
}

// Create and export the logger instance
export const logger = new Logger();

// Export the Logger class for custom logger creation
export default Logger;
