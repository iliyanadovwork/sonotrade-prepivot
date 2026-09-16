import { Request, Response, NextFunction } from 'express';
import { redisCache } from '../services/redis';
import crypto from 'crypto';

/**
 * Idempotency middleware for trade execution
 * Prevents duplicate trades by caching results for 60 seconds
 */
export async function tradeIdempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  try {
    // Create idempotency key based on user + request parameters
    const requestSignature = JSON.stringify({
      userId,
      inputMint: req.body.inputMint,
      outputMint: req.body.outputMint,
      amount: req.body.amount,
      side: req.body.side,
      outcome: req.body.outcome,
      ticker: req.body.ticker,
    });

    const idempotencyHash = crypto
      .createHash('sha256')
      .update(requestSignature)
      .digest('hex')
      .substring(0, 16);

    const idempotencyKey = `trade_idempotent:${userId}:${idempotencyHash}`;

    // Check if this exact trade was already processed
    const cachedResult = await redisCache.get(idempotencyKey);

    if (cachedResult) {
      console.log(`♻️  Returning cached trade result for user ${userId}`);
      res.json(cachedResult);
      return;
    }

    // Store idempotency key for later use
    (req as any).idempotencyKey = idempotencyKey;

    // Continue to trade execution
    next();
  } catch (error) {
    console.error('❌ Idempotency check error:', error);
    // On error, allow the request through (fail open)
    next();
  }
}

/**
 * Cache the trade result for idempotency
 * Call this after successful trade execution
 */
export async function cacheTradeResult(
  req: Request,
  result: any
): Promise<void> {
  const idempotencyKey = (req as any).idempotencyKey;

  if (!idempotencyKey) {
    return;
  }

  try {
    // Cache for 60 seconds
    await redisCache.set(idempotencyKey, result, 60);
    console.log(`💾 Cached trade result with key: ${idempotencyKey}`);
  } catch (error) {
    console.error('❌ Error caching trade result:', error);
  }
}
