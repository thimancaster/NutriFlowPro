
export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  checkLimit(key: string, maxRequests: number, windowMs: number) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return { allowed: false, retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000) };
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return { allowed: true };
  }
}

export const rateLimiter = new RateLimiter();
