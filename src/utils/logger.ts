
export interface LogOptions {
  context?: string;
  details?: any;
  level?: 'debug' | 'info' | 'warn' | 'error';
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  }

  /**
   * Format log messages with optional context and details
   */
  private format(message: string, options?: LogOptions | string): string {
    // Handle old method signature where options was just a string context
    if (typeof options === 'string') {
      return `[${options}] ${message}`;
    }

    // Handle new method signature with options object
    if (options?.context) {
      return `[${options.context}] ${message}`;
    }

    return message;
  }

  /**
   * Debug level logging - only in development
   */
  debug(message: string, options?: LogOptions | string): void {
    if (!this.isDevelopment) return;
    
    const formattedMessage = this.format(message, options);
    
    if (typeof options === 'object' && options?.details) {
      console.debug(formattedMessage, options.details);
    } else {
      console.debug(formattedMessage);
    }
  }

  /**
   * Info level logging
   */
  info(message: string, options?: LogOptions | string): void {
    const formattedMessage = this.format(message, options);
    
    if (typeof options === 'object' && options?.details) {
      console.info(formattedMessage, options.details);
    } else {
      console.info(formattedMessage);
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, options?: LogOptions | string): void {
    const formattedMessage = this.format(message, options);
    
    if (typeof options === 'object' && options?.details) {
      console.warn(formattedMessage, options.details);
    } else {
      console.warn(formattedMessage);
    }
  }

  /**
   * Error level logging
   */
  error(message: string, options?: LogOptions | string): void {
    const formattedMessage = this.format(message, options);
    
    if (typeof options === 'object' && options?.details) {
      console.error(formattedMessage, options.details);
    } else {
      console.error(formattedMessage);
    }
  }
}

export const logger = new Logger();
