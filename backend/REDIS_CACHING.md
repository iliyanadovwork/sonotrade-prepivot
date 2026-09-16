# Redis Caching for Kalshi API

## Overview

The backend implements a **hybrid Redis caching strategy** for Kalshi API requests to:
1. **Reduce API calls** and improve response times
2. **Handle API failures** gracefully with stale cache fallback
3. **Ensure data freshness** with configurable TTL (30 minutes default)

## How It Works

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                     Request Flow                            │
└─────────────────────────────────────────────────────────────┘

1. Client Request
        ↓
2. Check Redis Cache (TTL: 30 min)
        ↓
   ┌────────────┬────────────┐
   │  HIT       │   MISS     │
   │  (fresh)   │ (expired)  │
   └────────────┴────────────┘
        │             │
        ↓             ↓
   Return        Fetch from
   Cached        Kalshi API
   Data               │
                      ├──────────┬──────────┐
                      │ SUCCESS  │  FAIL    │
                      ↓          ↓
                   Cache &   Return Stale
                   Return    Cache (if exists)
                   Data
```

### Key Features

1. **30-Minute TTL**: Cache expires every 30 minutes, ensuring data is reasonably fresh
2. **Stale Cache Fallback**: If Kalshi API fails, returns last known good data (even if expired)
3. **Automatic Retry**: When cache expires, automatically fetches fresh data
4. **Zero Config**: Works automatically if Redis is available, degrades gracefully if not

## Setup

### 1. Install Redis

**Local Development:**
```bash
# macOS (using Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

**Production:**
- [Redis Cloud](https://redis.com/try-free/) (free tier available)
- [Upstash](https://upstash.com/) (serverless Redis)
- [AWS ElastiCache](https://aws.amazon.com/elasticache/)

### 2. Configure Environment

Add to your `.env` file:

```env
# Local development
REDIS_URL=redis://localhost:6379

# Production (example with Redis Cloud)
REDIS_URL=redis://default:password@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

The `ioredis` package is already added to `package.json`.

## Usage

### Cached Endpoints

The following Kalshi API endpoints are automatically cached:

1. **Event Data**: `GET /api/kalshi/events/:eventTicker`
   - Cache key: `kalshi:events/{ticker}` or `kalshi:events/{ticker}?with_nested_markets=true`
   - TTL: 30 minutes
   - Used on: Home page event cards

2. **Event Metadata**: `GET /api/kalshi/events/:eventTicker/metadata`
   - Cache key: `kalshi:events/{ticker}/metadata`
   - TTL: 30 minutes
   - Used on: Event detail pages (for images)

### Cache Management

#### Clear Cache for Specific Event

```bash
# Clear all cache for event INXD-24DEC31
DELETE /api/cache/kalshi/events/INXD-24DEC31
```

#### Clear All Kalshi Cache

```bash
# Clear entire Kalshi cache
DELETE /api/cache/kalshi/all
```

#### Check Cache Status

```bash
# Get cache info for an event
GET /api/cache/kalshi/events/INXD-24DEC31/info?with_nested_markets=true

# Response:
{
  "success": true,
  "endpoint": "events/INXD-24DEC31?with_nested_markets=true",
  "exists": true,
  "ttl": 1245,        // seconds remaining
  "age": 555          // seconds since cached
}
```

## Benefits

### Performance

- **First request**: Normal Kalshi API latency (~200-500ms)
- **Cached requests**: <10ms response time
- **Reduced API calls**: ~95% reduction for repeated requests

### Reliability

- **API downtime**: Users still get data from stale cache
- **Rate limiting**: Reduces risk of hitting Kalshi API rate limits
- **Cost savings**: Fewer API calls = lower costs (if metered)

### User Experience

- **Faster page loads**: Home page loads instantly from cache
- **Consistent performance**: No waiting for slow API responses
- **Graceful degradation**: App continues working even if Kalshi API is down

## Configuration

### Adjust Cache TTL

Edit `/backend/src/services/kalshiCache.ts`:

```typescript
private readonly DEFAULT_TTL = 1800; // 30 minutes in seconds

// Change to 5 minutes:
private readonly DEFAULT_TTL = 300;

// Change to 1 hour:
private readonly DEFAULT_TTL = 3600;
```

### Disable Stale Cache Fallback

In `/backend/src/routes/api.ts`, change:

```typescript
await kalshiCache.fetch(
  cacheEndpoint,
  fetchFn,
  {
    ttl: 1800,
    useStaleOnError: false, // ← Disable fallback
  }
);
```

## Monitoring

### Check Redis Connection

The backend logs will show:

```
✅ Redis connected successfully
```

Or if Redis is unavailable:

```
❌ Redis connection error: connect ECONNREFUSED 127.0.0.1:6379
⚠️  Redis not available, skipping cache get
```

### Cache Logging

Successful cache operations log:

```
✅ Cache HIT for events/INXD-24DEC31 (age: 324s)
💾 Cached Kalshi response for events/INXD-24DEC31 (TTL: 1800s)
```

Cache misses log:

```
❌ Cache MISS for events/INXD-24DEC31
🌐 Fetching from Kalshi API: events/INXD-24DEC31
```

Fallback to stale cache logs:

```
🔄 Attempting to use stale cache for events/INXD-24DEC31...
⚠️  Using stale cache for events/INXD-24DEC31 (age: 2156s)
```

## Troubleshooting

### Redis Not Connected

**Symptom**: Logs show "Redis not available" warnings

**Solution**:
1. Check if Redis is running: `redis-cli ping` (should return `PONG`)
2. Verify `REDIS_URL` in `.env` is correct
3. Check firewall/network settings

**Note**: App works without Redis, just with slower performance

### Stale Data Issues

**Symptom**: Users see outdated market prices

**Solutions**:
1. Reduce TTL to 5-10 minutes for more frequent updates
2. Clear cache manually: `DELETE /api/cache/kalshi/all`
3. Implement webhook-based cache invalidation when Kalshi updates data

### Memory Usage

**Symptom**: Redis using too much memory

**Solutions**:
1. Set Redis `maxmemory` policy: `maxmemory-policy allkeys-lru`
2. Monitor cache size: `redis-cli info memory`
3. Reduce TTL to expire data faster

## Production Best Practices

1. **Use Redis in Production**: Even if optional, highly recommended for performance
2. **Monitor Redis**: Use Redis monitoring tools (Redis Insight, Datadog, etc.)
3. **Set Memory Limits**: Configure `maxmemory` to prevent OOM issues
4. **Enable Persistence**: Use RDB or AOF for cache recovery after restarts
5. **Use Redis Cluster**: For high availability in production

## API Response Headers

To help debug caching, you could add these headers (optional enhancement):

```typescript
res.setHeader('X-Cache-Status', cached ? 'HIT' : 'MISS');
res.setHeader('X-Cache-Age', cacheAge);
res.setHeader('X-Cache-TTL', ttl);
```

## Future Enhancements

Potential improvements:

1. **Cache warming**: Pre-populate cache for popular events
2. **Webhook integration**: Invalidate cache when Kalshi pushes updates
3. **Per-user caching**: Cache user-specific data (positions, orders)
4. **Cache analytics**: Track hit/miss rates, most requested events
5. **Distributed caching**: Use Redis Cluster for multi-server deployments

## Questions?

- **Why 30 minutes?** Balances freshness vs. API load. Market data doesn't change rapidly.
- **Why use stale cache?** Better to show slightly old data than error messages.
- **Does it cache errors?** No, only successful API responses are cached.
- **Can I disable Redis?** Yes, app works without it (just slower).
