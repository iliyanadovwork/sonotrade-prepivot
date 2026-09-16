import { Request, Response, NextFunction } from 'express';
import { redisCache } from '../services/redis';

/**
 * Distributed locking middleware for trade execution
 * Ensures only one trade executes at a time per user
 */
export async function tradeLockMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const lockKey = `trade_lock:${userId}`;
  const lockValue = `${Date.now()}`; // Unique lock identifier
  const lockTTL = 30; // Lock expires after 30 seconds

  try {
    // Try to acquire lock using SET NX (set if not exists)
    const client = (redisCache as any).client;

    if (!client || !redisCache.isReady()) {
      console.warn('⚠️  Redis not available, skipping lock (allowing trade)');
      next();
      return;
    }

    // SET key value NX EX ttl - atomic operation
    const acquired = await client.set(lockKey, lockValue, 'NX', 'EX', lockTTL);

    if (!acquired) {
      // Lock already held by another request
      res.status(429).json({
        success: false,
        error: 'Trade in progress',
        message: 'Please wait for your current trade to complete before submitting another'
      });
      return;
    }

    // Lock acquired successfully
    console.log(`🔒 Trade lock acquired for user ${userId}`);

    // Store lock info for cleanup
    (req as any).tradeLockKey = lockKey;
    (req as any).tradeLockValue = lockValue;

    // Continue to next middleware/handler
    next();
  } catch (error) {
    console.error('❌ Trade lock error:', error);
    // On error, allow the request through (fail open)
    next();
  }
}

/**
 * Cleanup middleware to release lock after trade completes
 * Should be called in a finally block or after response is sent
 */
export async function releaseTradeLock(req: Request): Promise<void> {
  const lockKey = (req as any).tradeLockKey;
  const lockValue = (req as any).tradeLockValue;

  if (!lockKey || !lockValue) {
    return;
  }

  try {
    const client = (redisCache as any).client;
    if (!client || !redisCache.isReady()) {
      return;
    }

    // Only delete if lock value matches (prevent deleting another request's lock)
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    await client.eval(script, 1, lockKey, lockValue);
    console.log(`🔓 Trade lock released for ${lockKey}`);
  } catch (error) {
    console.error('❌ Error releasing trade lock:', error);
  }
}
