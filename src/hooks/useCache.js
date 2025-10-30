import { useState, useEffect, useCallback, useRef } from 'react';

// Global cache store
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes default
const STALE_TIME = 2 * 60 * 1000; // 2 minutes - data is considered stale after this

// Cache configuration for different data types
const CACHE_CONFIG = {
  projects: { duration: 10 * 60 * 1000, staleTime: 5 * 60 * 1000 }, // 10min cache, 5min stale
  thoughts: { duration: 10 * 60 * 1000, staleTime: 5 * 60 * 1000 },
  work: { duration: 30 * 60 * 1000, staleTime: 15 * 60 * 1000 }, // 30min cache, 15min stale
  courses: { duration: 15 * 60 * 1000, staleTime: 7 * 60 * 1000 },
  lessons: { duration: 20 * 60 * 1000, staleTime: 10 * 60 * 1000 },
  assignments: { duration: 15 * 60 * 1000, staleTime: 7 * 60 * 1000 },
  submissions: { duration: 5 * 60 * 1000, staleTime: 2 * 60 * 1000 }, // More dynamic content
  user: { duration: 15 * 60 * 1000, staleTime: 5 * 60 * 1000 },
};

// Cache entry structure
class CacheEntry {
  constructor(data, cacheType = 'default') {
    this.data = data;
    this.timestamp = Date.now();
    this.cacheType = cacheType;
    this.config = CACHE_CONFIG[cacheType] || { duration: CACHE_DURATION, staleTime: STALE_TIME };
  }

  isExpired() {
    return Date.now() - this.timestamp > this.config.duration;
  }

  isStale() {
    return Date.now() - this.timestamp > this.config.staleTime;
  }

  isValid() {
    return !this.isExpired();
  }
}

// Cache manager for invalidation and cleanup
export class CacheManager {
  static invalidateByPattern(pattern) {
    const keysToDelete = [];
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cache.delete(key));
  }

  static invalidateByType(cacheType) {
    const keysToDelete = [];
    for (const [key, entry] of cache.entries()) {
      if (entry.cacheType === cacheType) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cache.delete(key));
  }

  static clear() {
    cache.clear();
  }

  static cleanup() {
    const keysToDelete = [];
    for (const [key, entry] of cache.entries()) {
      if (entry.isExpired()) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cache.delete(key));
  }

  static getStats() {
    const stats = {
      totalEntries: cache.size,
      byType: {},
      expired: 0,
      stale: 0,
    };

    for (const [key, entry] of cache.entries()) {
      const type = entry.cacheType;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      if (entry.isExpired()) {
        stats.expired++;
      } else if (entry.isStale()) {
        stats.stale++;
      }
    }

    return stats;
  }
}

// Periodic cleanup
setInterval(() => {
  CacheManager.cleanup();
}, 60 * 1000); // Cleanup every minute

/**
 * Advanced caching hook with stale-while-revalidate pattern
 * @param {string} key - Unique cache key
 * @param {Function} fetchFunction - Function to fetch data
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, isStale, refetch, invalidate }
 */
export const useCache = (key, fetchFunction, options = {}) => {
  const {
    dependencies = [],
    cacheType = 'default',
    enabled = true,
    staleWhileRevalidate = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  
  const fetchFunctionRef = useRef(fetchFunction);
  const isMountedRef = useRef(true);
  
  // Update fetch function ref when it changes
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Generate cache key with dependencies
  const cacheKey = `${key}_${JSON.stringify(dependencies)}`;

  const fetchData = useCallback(async (isBackground = false) => {
    if (!enabled) {return;}

    try {
      if (!isBackground) {
        setLoading(true);
        setError(null);
      }

      const result = await fetchFunctionRef.current();
      
      if (!isMountedRef.current) {return;}

      // Store in cache
      const cacheEntry = new CacheEntry(result, cacheType);
      cache.set(cacheKey, cacheEntry);

      setData(result);
      setIsStale(false);
      if (!isBackground) {
        setLoading(false);
      }

      onSuccess?.(result);
    } catch (err) {
      if (!isMountedRef.current) {return;}

      setError(err);
      if (!isBackground) {
        setLoading(false);
      }

      onError?.(err);
    }
  }, [cacheKey, enabled, cacheType, onSuccess, onError]);

  const refetch = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cache.delete(cacheKey);
    return fetchData(false);
  }, [cacheKey, fetchData]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const cached = cache.get(cacheKey);

    if (cached && cached.isValid()) {
      // Use cached data
      setData(cached.data);
      setLoading(false);
      setError(null);

      if (cached.isStale() && staleWhileRevalidate) {
        // Data is stale, fetch in background
        setIsStale(true);
        fetchData(true);
      } else {
        setIsStale(false);
      }
    } else {
      // No valid cache, fetch fresh data
      fetchData(false);
    }
  }, [cacheKey, enabled, staleWhileRevalidate, fetchData]);

  return {
    data,
    loading,
    error,
    isStale,
    refetch,
    invalidate,
  };
};

/**
 * Hook for caching with automatic invalidation on mutations
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Fetch function
 * @param {Object} options - Options
 * @returns {Object} - Cache result with mutation helpers
 */
export const useCacheWithMutation = (key, fetchFunction, options = {}) => {
  const cacheResult = useCache(key, fetchFunction, options);

  const mutate = useCallback(async (mutationFn, optimisticData = null) => {
    const { cacheType = 'default' } = options;
    
    // Optimistic update
    if (optimisticData) {
      cacheResult.setData?.(optimisticData);
    }

    try {
      const result = await mutationFn();
      
      // Invalidate related cache entries
      CacheManager.invalidateByType(cacheType);
      
      // Refetch current data
      await cacheResult.refetch();
      
      return result;
    } catch (error) {
      // Revert optimistic update on error
      if (optimisticData) {
        await cacheResult.refetch();
      }
      throw error;
    }
  }, [cacheResult, options]);

  return {
    ...cacheResult,
    mutate,
  };
};

/**
 * Hook for prefetching data
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Fetch function
 * @param {Object} options - Options
 */
export const usePrefetch = (key, fetchFunction, options = {}) => {
  const { dependencies = [], cacheType = 'default', enabled = true } = options;
  
  const cacheKey = `${key}_${JSON.stringify(dependencies)}`;

  const prefetch = useCallback(async () => {
    if (!enabled) {return;}

    const cached = cache.get(cacheKey);
    if (cached && cached.isValid() && !cached.isStale()) {
      return cached.data; // Already have fresh data
    }

    try {
      const result = await fetchFunction();
      const cacheEntry = new CacheEntry(result, cacheType);
      cache.set(cacheKey, cacheEntry);
      return result;
    } catch (error) {
      console.warn('Prefetch failed:', error);
      return null;
    }
  }, [cacheKey, fetchFunction, enabled, cacheType]);

  return { prefetch };
};

/**
 * Hook for cache statistics and debugging
 */
export const useCacheStats = () => {
  const [stats, setStats] = useState(CacheManager.getStats());

  const updateStats = useCallback(() => {
    setStats(CacheManager.getStats());
  }, []);

  useEffect(() => {
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [updateStats]);

  return {
    stats,
    updateStats,
    clearCache: CacheManager.clear,
    cleanup: CacheManager.cleanup,
    invalidateByType: CacheManager.invalidateByType,
    invalidateByPattern: CacheManager.invalidateByPattern,
  };
};

export default useCache;