
import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

export const usePerformanceCache = <T>(options: CacheOptions = {}) => {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // Default 5 minutes TTL
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());

  const isExpired = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  const get = useCallback((key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (isExpired(entry)) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }
    
    return entry.data;
  }, [cache, isExpired]);

  const set = useCallback((key: string, data: T, customTtl?: number): void => {
    setCache(prev => {
      const newCache = new Map(prev);
      
      // Remove expired entries and enforce max size
      if (newCache.size >= maxSize) {
        const entries = Array.from(newCache.entries());
        const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Remove oldest entries to make room
        const toRemove = Math.max(1, Math.floor(maxSize * 0.2));
        for (let i = 0; i < toRemove; i++) {
          newCache.delete(sortedEntries[i][0]);
        }
      }
      
      newCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: customTtl || ttl
      });
      
      return newCache;
    });
  }, [ttl, maxSize]);

  const clear = useCallback((): void => {
    setCache(new Map());
  }, []);

  const remove = useCallback((key: string): void => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  // Cleanup expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCache(prev => {
        const newCache = new Map(prev);
        const now = Date.now();
        
        for (const [key, entry] of newCache) {
          if (now - entry.timestamp > entry.ttl) {
            newCache.delete(key);
          }
        }
        
        return newCache;
      });
    }, ttl / 2); // Clean up twice per TTL period

    return () => clearInterval(interval);
  }, [ttl]);

  return {
    get,
    set,
    clear,
    remove,
    size: cache.size
  };
};
