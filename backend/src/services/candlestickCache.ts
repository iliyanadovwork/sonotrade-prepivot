import { redisCache } from './redis';

interface CandlestickCacheOptions {
  ttl?: number; // TTL in seconds, default 5 minutes
  useStaleOnError?: boolean; // Return stale cache if API fails
}

interface CachedData<T> {
  data: T;
  cachedAt: number;
}

/**
 * Candlestick Cache Service
 * Caches candlestick data from Dflow API for featured events
 * Implements hybrid caching strategy:
 * 1. Check cache first (5-min TTL for fresh market data)
 * 2. If miss/expired, fetch from Dflow API
 * 3. If API fails, fallback to stale cache
 */
class CandlestickCache {
  private readonly DEFAULT_TTL = 300; // 5 minutes in seconds (fresh market data)
  private readonly CACHE_PREFIX = 'candlestick:';

  /**
   * Generate cache key for candlestick requests
   * Format: candlestick:market:{ticker}:60:1234567890:1234567900
   * or: candlestick:event:{ticker}:1440:1234567890:1234567900
   */
  private getCacheKey(
    type: 'market' | 'event',
    ticker: string,
    params: { startTs: number; endTs: number; periodInterval: number }
  ): string {
    const { startTs, endTs, periodInterval } = params;
    return `${this.CACHE_PREFIX}${type}:${ticker}:${periodInterval}:${startTs}:${endTs}`;
  }

  /**
   * Get pattern for all cache keys related to a ticker
   * Used for clearing all cached data for a ticker
   */
  private getTickerPattern(ticker: string): string {
    return `${this.CACHE_PREFIX}*:${ticker}:*`;
  }

  /**
   * Fetch candlesticks with caching
   * @param type market or event candlesticks
   * @param ticker Ticker symbol
   * @param params Start/end timestamps and period interval
   * @param fetchFn Function that fetches data from Dflow API
   * @param options Cache options
   */
  async fetch<T>(
    type: 'market' | 'event',
    ticker: string,
    params: { startTs: number; endTs: number; periodInterval: number },
    fetchFn: () => Promise<T>,
    options: CandlestickCacheOptions = {}
  ): Promise<T> {
    const {
      ttl = this.DEFAULT_TTL,
      useStaleOnError = true,
    } = options;

    const cacheKey = this.getCacheKey(type, ticker, params);

    // Step 1: Try to get from cache
    try {
      const cached = await redisCache.get<CachedData<T>>(cacheKey);

      if (cached) {
        const age = Math.floor((Date.now() - cached.cachedAt) / 1000);
        console.log(`✅ Candlestick Cache HIT for ${type}:${ticker} (age: ${age}s)`);
        return cached.data;
      }

      console.log(`❌ Candlestick Cache MISS for ${type}:${ticker}`);
    } catch (error) {
      console.error('Candlestick cache read error:', error);
      // Continue to fetch from API
    }

    // Step 2: Cache miss or expired - fetch from Dflow API
    try {
      console.log(`🌐 Fetching candlesticks from Dflow API: ${type}:${ticker}`);
      const data = await fetchFn();

      // Step 3: Cache the successful response
      const cachedData: CachedData<T> = {
        data,
        cachedAt: Date.now(),
      };

      await redisCache.set(cacheKey, cachedData, ttl);
      console.log(`💾 Cached candlesticks for ${type}:${ticker} (TTL: ${ttl}s)`);

      return data;
    } catch (error) {
      console.error('Dflow candlestick API fetch error:', error);

      // Step 4: Fallback to stale cache if enabled
      if (useStaleOnError) {
        console.log(`🔄 Attempting to use stale cache for ${type}:${ticker}...`);
        try {
          const stale = await redisCache.getStale<CachedData<T>>(cacheKey);
          if (stale) {
            const age = Math.floor((Date.now() - stale.cachedAt) / 1000);
            console.log(`⚠️  Using stale cache for ${type}:${ticker} (age: ${age}s)`);
            return stale.data;
          }
        } catch (staleError) {
          console.error('Failed to get stale cache:', staleError);
        }
      }

      // No cache available, re-throw error
      throw error;
    }
  }

  /**
   * Invalidate all candlestick cache for a specific ticker
   * This clears all cached data (all intervals, all time ranges) for the ticker
   * Used when unfeaturing a ticker
   */
  async invalidateTickerCache(ticker: string): Promise<number> {
    try {
      const pattern = this.getTickerPattern(ticker);
      console.log(`🗑️  Invalidating all candlestick cache for ticker: ${ticker} (pattern: ${pattern})`);

      const deletedCount = await redisCache.deleteByPattern(pattern);
      console.log(`✅ Deleted ${deletedCount} candlestick cache entries for ${ticker}`);

      return deletedCount;
    } catch (error) {
      console.error('Failed to invalidate ticker cache:', error);
      return 0;
    }
  }

  /**
   * Invalidate cache for a specific candlestick request
   */
  async invalidate(
    type: 'market' | 'event',
    ticker: string,
    params: { startTs: number; endTs: number; periodInterval: number }
  ): Promise<boolean> {
    const cacheKey = this.getCacheKey(type, ticker, params);
    console.log(`🗑️  Invalidating candlestick cache: ${cacheKey}`);
    return await redisCache.delete(cacheKey);
  }

  /**
   * Get cache info (TTL, age) for debugging
   */
  async getCacheInfo(
    type: 'market' | 'event',
    ticker: string,
    params: { startTs: number; endTs: number; periodInterval: number }
  ): Promise<{
    exists: boolean;
    ttl: number;
    age?: number;
  }> {
    const cacheKey = this.getCacheKey(type, ticker, params);
    const ttl = await redisCache.getTTL(cacheKey);
    const cached = await redisCache.get<CachedData<any>>(cacheKey);

    return {
      exists: ttl > 0,
      ttl,
      age: cached ? Math.floor((Date.now() - cached.cachedAt) / 1000) : undefined,
    };
  }
}

export const candlestickCache = new CandlestickCache();
