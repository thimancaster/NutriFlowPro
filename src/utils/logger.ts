
/**
 * Simple structured logger for the application
 * This can be extended to send logs to a service like LogRocket or Sentry
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  details?: any;
  user?: string;
  tags?: string[];
}

// Enable or disable debug logs based on environment
const DEBUG_ENABLED = process.env.NODE_ENV === 'development';

// Centralized logger implementation
class Logger {
  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const context = options?.context ? `[${options.context}]` : '';
    const tags = options?.tags?.length ? `(${options.tags.join(', ')})` : '';
    return `${timestamp} ${level.toUpperCase()}: ${context} ${message} ${tags}`.trim();
  }
  
  private log(level: LogLevel, message: string, options?: LogOptions): void {
    // Skip debug logs in production unless explicitly enabled
    if (level === 'debug' && !DEBUG_ENABLED) {
      return;
    }
    
    const formattedMessage = this.formatMessage(level, message, options);
    const details = options?.details;
    
    // Log to console using appropriate method
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, details || '');
        break;
      case 'info':
        console.info(formattedMessage, details || '');
        break;
      case 'warn':
        console.warn(formattedMessage, details || '');
        break;
      case 'error':
        console.error(formattedMessage, details || '');
        break;
    }
    
    // In a real application, we could send logs to a service here
    this.sendToExternalService(level, message, options);
  }
  
  private sendToExternalService(level: LogLevel, message: string, options?: LogOptions): void {
    // This would be implemented to send logs to LogRocket, Sentry, etc.
    // For now it's just a placeholder
    if (level === 'error' && typeof window !== 'undefined') {
      // Example: if Sentry were integrated
      // Sentry.captureMessage(message, {
      //   level: Sentry.Severity.Error,
      //   tags: {
      //     context: options?.context,
      //     ...(options?.tags?.reduce((acc, tag) => ({ ...acc, [tag]: true }), {}))
      //   },
      //   extra: options?.details
      // });
    }
  }
  
  debug(message: string, options?: LogOptions): void {
    this.log('debug', message, options);
  }
  
  info(message: string, options?: LogOptions): void {
    this.log('info', message, options);
  }
  
  warn(message: string, options?: LogOptions): void {
    this.log('warn', message, options);
  }
  
  error(message: string, options?: LogOptions): void {
    this.log('error', message, options);
  }
}

// Export singleton instance
export const logger = new Logger();

// Usage examples:
// logger.info('User logged in', { user: 'user@example.com', context: 'Auth' });
// logger.error('API call failed', { details: error, context: 'API', tags: ['payment', 'critical'] });
