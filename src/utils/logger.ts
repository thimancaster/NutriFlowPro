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
  // Track log counts to prevent excessive logging of the same message
  private logCounts: Record<string, { count: number, lastLogged: number }> = {};
  private readonly LOG_THROTTLE_TIME = 5000; // 5 seconds between repeated logs
  private readonly MAX_REPEATED_LOGS = 5; // Max number of identical logs before throttling

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
      this._log('debug', message, args);
    }
  }

  /**
   * Info logs - important information that can be shown in production
   */
  info(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production' || this.options.enabledInProduction) {
      this._log('info', message, args);
    }
  }

  /**
   * Warning logs - potential issues that should be addressed
   */
  warn(message: string, ...args: any[]): void {
    this._log('warn', message, args);
  }

  /**
   * Error logs - always shown in all environments
   */
  error(message: string, ...args: any[]): void {
    this._log('error', message, args);
  }

  /**
   * Internal method to log messages with throttling for repeated logs
   */
  private _log(level: LogLevel, message: string, args: any[]): void {
    // Create a key for this log message
    const key = `${level}:${message}`;
    const now = Date.now();
    
    // Initialize tracking if this is a new message
    if (!this.logCounts[key]) {
      this.logCounts[key] = { count: 0, lastLogged: 0 };
    }
    
    const logInfo = this.logCounts[key];
    logInfo.count++;
    
    // Check if we should log or throttle
    const timeSinceLastLog = now - logInfo.lastLogged;
    
    if (logInfo.count <= this.MAX_REPEATED_LOGS || timeSinceLastLog >= this.LOG_THROTTLE_TIME) {
      // Reset counter if it's been a while
      if (timeSinceLastLog >= this.LOG_THROTTLE_TIME) {
        logInfo.count = 1;
      }
      
      // Log the message with appropriate console method
      switch (level) {
        case 'debug':
        case 'info':
          console.log(`[${level.toUpperCase()}] ${message}`, ...args);
          break;
        case 'warn':
          console.warn(`[${level.toUpperCase()}] ${message}`, ...args);
          break;
        case 'error':
          console.error(`[${level.toUpperCase()}] ${message}`, ...args);
          break;
      }
      
      // Update last logged time
      logInfo.lastLogged = now;
    } else if (logInfo.count === this.MAX_REPEATED_LOGS + 1) {
      // Log a throttling message once we hit the limit
      console.warn(`[THROTTLED] Message "${message}" logged ${this.MAX_REPEATED_LOGS} times. Suppressing further logs of this message for ${this.LOG_THROTTLE_TIME/1000}s`);
      logInfo.lastLogged = now;
    }
    // Otherwise, do nothing (the message is throttled)
  }
}

// Create and export the logger instance
export const logger = new Logger();

// Export the Logger class for custom logger creation
export default Logger;
