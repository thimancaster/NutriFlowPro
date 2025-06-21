
/**
 * Calculation caching system
 * Phase 2: Performance optimization for nutritional calculations
 */

interface CachedCalculation {
  inputs: string; // Hash of inputs
  results: any;
  timestamp: number;
  ttl: number;
}

export class CalculationCache {
  private static cache = new Map<string, CachedCalculation>();
  private static readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Generate cache key from calculation inputs
   */
  private static generateKey(inputs: Record<string, any>): string {
    const sortedInputs = Object.keys(inputs)
      .sort()
      .reduce((obj, key) => {
        obj[key] = inputs[key];
        return obj;
      }, {} as Record<string, any>);
    
    return btoa(JSON.stringify(sortedInputs)).replace(/[/+=]/g, '');
  }

  /**
   * Get cached calculation result
   */
  static get(inputs: Record<string, any>): any | null {
    const key = this.generateKey(inputs);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return {
      ...cached.results,
      fromCache: true,
      cacheAge: Date.now() - cached.timestamp
    };
  }

  /**
   * Store calculation result in cache
   */
  static set(inputs: Record<string, any>, results: any, ttl = this.DEFAULT_TTL): void {
    const key = this.generateKey(inputs);
    
    this.cache.set(key, {
      inputs: JSON.stringify(inputs),
      results: { ...results, fromCache: false },
      timestamp: Date.now(),
      ttl
    });
    
    // Clean old entries periodically
    if (this.cache.size > 100) {
      this.cleanup();
    }
  }

  /**
   * Clean expired cache entries
   */
  private static cleanup(): void {
    const now = Date.now();
    
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, cached]) => ({
        key,
        age: Date.now() - cached.timestamp,
        ttl: cached.ttl
      }))
    };
  }
}
