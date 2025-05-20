
/**
 * Database caching service
 * Provides memory caching for database queries to reduce load and improve performance
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class DbCacheService {
  private caches: Map<string, Map<string, CacheEntry<any>>> = new Map();
  private DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Get a cached value for a specific cache and key
   * @param cacheName Name of the cache
   * @param key Cache key
   * @param ttl TTL in milliseconds (default: 5 minutes)
   * @returns Cached value or undefined if not found or expired
   */
  get<T>(cacheName: string, key: string, ttl: number = this.DEFAULT_TTL): T | undefined {
    // Get or create cache for this name
    if (!this.caches.has(cacheName)) {
      return undefined;
    }
    
    const cache = this.caches.get(cacheName)!;
    const entry = cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > ttl) {
      cache.delete(key);
      return undefined;
    }
    
    return entry.data;
  }

  /**
   * Set a value in the cache
   * @param cacheName Name of the cache
   * @param key Cache key
   * @param data Data to cache
   */
  set<T>(cacheName: string, key: string, data: T): void {
    // Get or create cache for this name
    if (!this.caches.has(cacheName)) {
      this.caches.set(cacheName, new Map());
    }
    
    const cache = this.caches.get(cacheName)!;
    
    // Store data with current timestamp
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear a specific cache entry
   * @param cacheName Name of the cache
   * @param key Cache key
   */
  clear(cacheName: string, key: string): void {
    if (this.caches.has(cacheName)) {
      const cache = this.caches.get(cacheName)!;
      cache.delete(key);
    }
  }

  /**
   * Clear an entire cache
   * @param cacheName Name of the cache to clear
   */
  clearCache(cacheName: string): void {
    this.caches.delete(cacheName);
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.caches.clear();
  }

  /**
   * Execute a function with caching
   * @param cacheName Name of the cache
   * @param key Cache key
   * @param fn Function to execute if cache miss
   * @param ttl TTL in milliseconds (default: 5 minutes)
   * @returns Cached or fresh data
   */
  async executeWithCache<T>(
    cacheName: string, 
    key: string, 
    fn: () => Promise<T>, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(cacheName, key, ttl);
    if (cached !== undefined) {
      return cached;
    }
    
    // Cache miss, execute function
    const result = await fn();
    
    // Cache the result
    this.set(cacheName, key, result);
    
    return result;
  }
}

// Create singleton instance
export const dbCache = new DbCacheService();
