import { Request, Response, NextFunction } from 'express';
import { redisCache } from '../services/redis';

interface RateLimitConfig {
  windowSeconds: number; // Time window
  maxRequests: number;   // Max requests per window
}

/**
 * Rate limiting middleware using sliding window
 * Limits requests per user per time window
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const rateLimitKey = `rate_limit:${userId}`;
    const now = Date.now();
    const windowStart = now - (config.windowSeconds * 1000);

    try {
      const client = (redisCache as any).client;

      if (!client || !redisCache.isReady()) {
        console.warn('⚠️  Redis not available, skipping rate limit');
        next();
        return;
      }

      // Use sorted set to track requests with timestamps
      // Remove old requests outside the window
      await client.zremrangebyscore(rateLimitKey, '-inf', windowStart);

      // Count requests in current window
      const requestCount = await client.zcard(rateLimitKey);

      if (requestCount >= config.maxRequests) {
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: `Maximum ${config.maxRequests} requests per ${config.windowSeconds} seconds. Please slow down.`
        });
        return;
      }

      // Add current request to the window
      await client.zadd(rateLimitKey, now, `${now}-${Math.random()}`);

      // Set expiry on the key (cleanup)
      await client.expire(rateLimitKey, config.windowSeconds);

      // Continue to next middleware
      next();
    } catch (error) {
      console.error('❌ Rate limit error:', error);
      // On error, allow the request through (fail open)
      next();
    }
  };
}

/**
 * Trade-specific rate limiter: 10 requests per 10 seconds per user
 */
export const tradeRateLimiter = createRateLimiter({
  windowSeconds: 10,
  maxRequests: 10
});
