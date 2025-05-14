
/**
 * Logger utility to handle console logging in different environments
 * This helps prevent exposing sensitive information in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isProduction: boolean;
  
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }
  
  /**
   * Debug logs - only shown in development
   */
  debug(...args: any[]): void {
    if (!this.isProduction) {
      console.log('[DEBUG]', ...args);
    }
  }
  
  /**
   * Info logs - only shown in development
   */
  info(...args: any[]): void {
    if (!this.isProduction) {
      console.info('[INFO]', ...args);
    }
  }
  
  /**
   * Warning logs - shown in all environments
   */
  warn(...args: any[]): void {
    console.warn('[WARN]', ...args);
  }
  
  /**
   * Error logs - shown in all environments
   */
  error(...args: any[]): void {
    console.error('[ERROR]', ...args);
  }
  
  /**
   * Development-only logs
   */
  dev(...args: any[]): void {
    if (!this.isProduction) {
      console.log('[DEV]', ...args);
    }
  }
}

export const logger = new Logger();
