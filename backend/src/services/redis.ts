import Redis from 'ioredis';

class RedisCache {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        enableOfflineQueue: false,
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis connection error:', err.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('⚠️  Redis connection closed');
        this.isConnected = false;
      });

      // Attempt to connect
      this.client.connect().catch((err) => {
        console.error('❌ Failed to connect to Redis:', err.message);
        this.isConnected = false;
      });
    } catch (error) {
      console.error('❌ Redis initialization error:', error);
      this.isConnected = false;
    }
  }

  /**
   * Get data from cache
   * @param key Cache key
   * @returns Cached data or null if not found
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️  Redis not available, skipping cache get');
      return null;
    }

    try {
      const data = await this.client.get(key);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Set data in cache with TTL
   * @param key Cache key
   * @param value Data to cache
   * @param ttlSeconds TTL in seconds (default: 30 minutes)
   */
  async set(key: string, value: any, ttlSeconds: number = 1800): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️  Redis not available, skipping cache set');
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttlSeconds, serialized);
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  /**
   * Get data without expiry check (for fallback scenarios)
   * This gets stale data that might have expired
   */
  async getStale<T = any>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      // Check if key exists with any TTL (including expired)
      const data = await this.client.get(key);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Redis GET STALE error:', error);
      return null;
    }
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DELETE error:', error);
      return false;
    }
  }

  /**
   * Get TTL (time-to-live) for a key
   */
  async getTTL(key: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return -2; // Key doesn't exist
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -2;
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async flush(): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      console.error('Redis FLUSH error:', error);
      return false;
    }
  }

  /**
   * Check if Redis is connected
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Delete all keys matching a pattern
   * Uses SCAN for better performance than KEYS
   * @param pattern Redis key pattern (e.g., "candlestick:*:TICKER:*")
   * @returns Number of keys deleted
   */
  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      let cursor = '0';
      let deletedCount = 0;
      const keysToDelete: string[] = [];

      // Use SCAN to iterate through keys matching the pattern
      do {
        const result = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = result[0];
        const keys = result[1];

        if (keys.length > 0) {
          keysToDelete.push(...keys);
        }
      } while (cursor !== '0');

      // Delete all matched keys
      if (keysToDelete.length > 0) {
        deletedCount = await this.client.del(...keysToDelete);
        console.log(`🗑️  Deleted ${deletedCount} keys matching pattern: ${pattern}`);
      }

      return deletedCount;
    } catch (error) {
      console.error('Redis DELETE BY PATTERN error:', error);
      return 0;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCache();
