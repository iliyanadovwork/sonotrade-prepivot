import { redisCache } from './redis';

interface KalshiCacheOptions {
  ttl?: number; // TTL in seconds, default 30 minutes
  useStaleOnError?: boolean; // Return stale cache if API fails
}

interface CachedData<T> {
  data: T;
  cachedAt: number;
}

/**
 * Kalshi API Cache Service
 * Implements organic refresh strategy:
 * 1. Always try to fetch fresh from API
 * 2. On success: Update cache
 * 3. On failure (rate limit/error): Return cached data as fallback
 * 4. No TTL expiration - cache stays until organically refreshed
 */
class KalshiCache {
  private readonly DEFAULT_TTL = 604800; // 7 days (effectively no expiration)
  private readonly CACHE_PREFIX = 'kalshi:';

  /**
   * Generate cache key for Kalshi API requests
   */
  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params
      ? Object.entries(params)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}=${v}`)
          .join('&')
      : '';

    return `${this.CACHE_PREFIX}${endpoint}${paramString ? '?' + paramString : ''}`;
  }

  /**
   * Fetch data with organic refresh strategy
   * @param endpoint Kalshi API endpoint (e.g., 'events/INXD-24DEC31')
   * @param fetchFn Function that fetches data from Kalshi API
   * @param options Cache options
   */
  async fetch<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    options: KalshiCacheOptions = {}
  ): Promise<T> {
    const {
      ttl = this.DEFAULT_TTL,
      useStaleOnError = true,
    } = options;

    const cacheKey = this.getCacheKey(endpoint);

    // Step 1: Always try to fetch fresh data from API
    try {
      console.log(`🌐 Fetching fresh from Kalshi API: ${endpoint}`);
      const data = await fetchFn();

      // Step 2: Update cache with fresh data (organic refresh)
      const cachedData: CachedData<T> = {
        data,
        cachedAt: Date.now(),
      };

      await redisCache.set(cacheKey, cachedData, ttl);
      console.log(`✅ Fresh data cached for ${endpoint}`);

      return data;
    } catch (error) {
      console.error('⚠️  API error (rate limit or network):', error instanceof Error ? error.message : error);

      // Step 3: Fallback to cached data (no expiration check)
      if (useStaleOnError) {
        try {
          const cached = await redisCache.getStale<CachedData<T>>(cacheKey);
          if (cached) {
            const age = Math.floor((Date.now() - cached.cachedAt) / 1000);
            console.log(`🔄 Using cached fallback for ${endpoint} (age: ${age}s)`);
            return cached.data;
          } else {
            console.log(`❌ No cached data available for ${endpoint}`);
          }
        } catch (cacheError) {
          console.error('Cache read error:', cacheError);
        }
      }

      // No cache available, re-throw error
      throw error;
    }
  }

  /**
   * Invalidate cache for a specific endpoint
   */
  async invalidate(endpoint: string, params?: Record<string, any>): Promise<boolean> {
    const cacheKey = this.getCacheKey(endpoint, params);
    console.log(`🗑️  Invalidating cache for ${endpoint}`);
    return await redisCache.delete(cacheKey);
  }

  /**
   * Get cache info (TTL, age) for debugging
   */
  async getCacheInfo(endpoint: string, params?: Record<string, any>): Promise<{
    exists: boolean;
    ttl: number;
    age?: number;
  }> {
    const cacheKey = this.getCacheKey(endpoint, params);
    const ttl = await redisCache.getTTL(cacheKey);
    const cached = await redisCache.get<CachedData<any>>(cacheKey);

    return {
      exists: ttl > 0,
      ttl,
      age: cached ? Math.floor((Date.now() - cached.cachedAt) / 1000) : undefined,
    };
  }

  /**
   * Clear all Kalshi cache
   */
  async clearAll(): Promise<boolean> {
    console.log('🗑️  Clearing all Kalshi cache');
    // Note: This is a simple implementation. For production,
    // you might want to use Redis SCAN with pattern matching
    return await redisCache.flush();
  }
}

export const kalshiCache = new KalshiCache();
