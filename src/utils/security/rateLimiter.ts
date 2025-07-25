
interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message: string;
}

export class RateLimiter {
  private windowMs: number;
  private max: number;
  private message: string;
  private requests: Map<string, number[]> = new Map();

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.message = options.message;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.max) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  // Legacy method for backward compatibility
  check(identifier: string): boolean {
    return this.isAllowed(identifier);
  }
}
