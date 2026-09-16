import { redisCache } from './redis';

interface NewsCacheOptions {
  ttl?: number; // TTL in seconds, default 1 day
  useStaleOnError?: boolean; // Return stale cache if API fails
}

interface CachedData<T> {
  data: T;
  cachedAt: number;
}

/**
 * News API Cache Service
 * Implements hybrid caching strategy:
 * 1. Check cache first (1-day TTL)
 * 2. If miss/expired, fetch from News API
 * 3. If API fails, fallback to stale cache
 */
class NewsCache {
  private readonly DEFAULT_TTL = 86400; // 1 day in seconds
  private readonly CACHE_PREFIX = 'news:';

  /**
   * Generate cache key for News API requests
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
   * Fetch data with caching
   * @param endpoint News API endpoint identifier (e.g., event title)
   * @param fetchFn Function that fetches data from News API
   * @param options Cache options
   */
  async fetch<T>(
    endpoint: string,
    fetchFn: () => Promise<T>,
    options: NewsCacheOptions = {}
  ): Promise<T> {
    const {
      ttl = this.DEFAULT_TTL,
      useStaleOnError = true,
    } = options;

    const cacheKey = this.getCacheKey(endpoint);

    // Step 1: Try to get from cache
    try {
      const cached = await redisCache.get<CachedData<T>>(cacheKey);

      if (cached) {
        const age = Math.floor((Date.now() - cached.cachedAt) / 1000);
        console.log(`✅ News Cache HIT for ${endpoint} (age: ${age}s)`);
        return cached.data;
      }

      console.log(`❌ News Cache MISS for ${endpoint}`);
    } catch (error) {
      console.error('News cache read error:', error);
      // Continue to fetch from API
    }

    // Step 2: Cache miss or expired - fetch from News API
    try {
      console.log(`🌐 Fetching from News API: ${endpoint}`);
      const data = await fetchFn();

      // Step 3: Cache the successful response
      const cachedData: CachedData<T> = {
        data,
        cachedAt: Date.now(),
      };

      await redisCache.set(cacheKey, cachedData, ttl);
      console.log(`💾 Cached News response for ${endpoint} (TTL: ${ttl}s)`);

      return data;
    } catch (error) {
      console.error('News API fetch error:', error);

      // Step 4: Fallback to stale cache if enabled
      if (useStaleOnError) {
        console.log(`🔄 Attempting to use stale cache for ${endpoint}...`);
        try {
          const stale = await redisCache.getStale<CachedData<T>>(cacheKey);
          if (stale) {
            const age = Math.floor((Date.now() - stale.cachedAt) / 1000);
            console.log(`⚠️  Using stale News cache for ${endpoint} (age: ${age}s)`);
            return stale.data;
          }
        } catch (staleError) {
          console.error('Failed to get stale News cache:', staleError);
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
    console.log(`🗑️  Invalidating News cache for ${endpoint}`);
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
   * Clear all News cache
   */
  async clearAll(): Promise<boolean> {
    console.log('🗑️  Clearing all News cache');
    return await redisCache.flush();
  }
}

export const newsCache = new NewsCache();
