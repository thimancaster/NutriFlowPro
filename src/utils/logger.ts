
export interface LogOptions {
  context?: string;
  details?: any;
  level?: 'debug' | 'info' | 'warn' | 'error';
  user?: any;
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
   * Convert various input types to LogOptions
   */
  private normalizeOptions(options?: any): LogOptions | undefined {
    if (!options) return undefined;
    
    // If already a LogOptions object
    if (typeof options === 'object' && (options.context || options.details || options.level)) {
      return options as LogOptions;
    }
    
    // If it's a string, assume it's a context
    if (typeof options === 'string') {
      return { context: options };
    }
    
    // For other object types, use as details
    if (typeof options === 'object') {
      return { details: options };
    }
    
    return undefined;
  }

  /**
   * Debug level logging - only in development
   */
  debug(message: string, options?: LogOptions | string | any): void {
    if (!this.isDevelopment) return;
    
    const normalizedOptions = this.normalizeOptions(options);
    const formattedMessage = this.format(message, normalizedOptions);
    
    if (normalizedOptions?.details) {
      console.debug(formattedMessage, normalizedOptions.details);
    } else {
      console.debug(formattedMessage);
    }
  }

  /**
   * Info level logging
   */
  info(message: string, options?: LogOptions | string | any): void {
    const normalizedOptions = this.normalizeOptions(options);
    const formattedMessage = this.format(message, normalizedOptions);
    
    if (normalizedOptions?.details) {
      console.info(formattedMessage, normalizedOptions.details);
    } else {
      console.info(formattedMessage);
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, options?: LogOptions | string | any): void {
    const normalizedOptions = this.normalizeOptions(options);
    const formattedMessage = this.format(message, normalizedOptions);
    
    if (normalizedOptions?.details) {
      console.warn(formattedMessage, normalizedOptions.details);
    } else {
      console.warn(formattedMessage);
    }
  }

  /**
   * Error level logging
   */
  error(message: string, options?: LogOptions | string | any): void {
    const normalizedOptions = this.normalizeOptions(options);
    const formattedMessage = this.format(message, normalizedOptions);
    
    if (normalizedOptions?.details) {
      console.error(formattedMessage, normalizedOptions.details);
    } else {
      console.error(formattedMessage);
    }
  }
}

export const logger = new Logger();
