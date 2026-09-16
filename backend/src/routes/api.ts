import { Router } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Event from '../models/Event';
import Comment from '../models/Comment';
import Category from '../models/Category';
import Featured from '../models/Featured';
import { GeoBlock } from '../models/GeoBlock';
import { dflowService } from '../services/dflow';
import authRoutes from './auth';
import kycRoutes from './kyc';
import { authenticateToken, authenticateAdmin } from '../middleware/auth';
import { decryptPrivateKey } from '../services/crypto';
import { Keypair, VersionedTransaction, Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { v4 as uuidv4 } from 'uuid';
import { Trade } from '../models/Trade';
import { kalshiCache } from '../services/kalshiCache';
import { candlestickCache } from '../services/candlestickCache';
import { NewsService } from '../services/news';
import { newsCache } from '../services/newsCache';
import { tradeLockMiddleware, releaseTradeLock } from '../middleware/tradeLocking';
import { tradeRateLimiter } from '../middleware/rateLimiting';
import { tradeIdempotencyMiddleware, cacheTradeResult } from '../middleware/idempotency';

const router = Router();

// Constants
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Mount auth routes
router.use('/auth', authRoutes);

// Mount KYC routes
router.use('/kyc', kycRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
  });
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ 
      success: true,
      count: users.length,
      users 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const user = await User.create({ username, email });
    
    res.status(201).json({ 
      success: true,
      user 
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to update user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'User deleted successfully',
      user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Dflow API Routes
// Get all events from Dflow
router.get('/dflow/events', async (req, res) => {
  try {
    const {
      limit,
      cursor,
      withNestedMarkets,
      seriesTickers,
      tickers,
      isInitialized,
      status,
      sort
    } = req.query;

    // Build cache key from query params
    const params = {
      limit: limit ? parseInt(limit as string) : undefined,
      cursor: cursor ? parseInt(cursor as string) : undefined,
      withNestedMarkets: withNestedMarkets === 'true' ? true : withNestedMarkets === 'false' ? false : undefined,
      seriesTickers: seriesTickers as string | undefined,
      tickers: tickers as string | undefined,
      isInitialized: isInitialized === 'true' ? true : isInitialized === 'false' ? false : undefined,
      status: status as 'initialized' | 'active' | 'inactive' | 'closed' | 'determined' | undefined,
      sort: sort as 'volume' | 'volume24h' | 'liquidity' | 'openInterest' | 'startDate' | undefined,
    };

    const cacheKey = `dflow:events:${JSON.stringify(params)}`;

    // Use cache with 5-minute TTL (shorter for list endpoints as they change more frequently)
    const result = await kalshiCache.fetch(
      cacheKey,
      async () => {
        return await dflowService.getEvents(params);
      },
      {
        useStaleOnError: true, // Use cached data as fallback
      }
    );

    res.json({
      success: true,
      events: result.events,
      cursor: result.cursor,
    });
  } catch (error) {
    console.error('Dflow API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if it's an authentication error (403)
    const isAuthError = errorMessage.includes('403') || errorMessage.includes('Forbidden');

    res.status(isAuthError ? 401 : 500).json({
      success: false,
      error: isAuthError ? 'Dflow API authentication failed' : 'Failed to fetch events from Dflow API',
      message: errorMessage,
      details: isAuthError ? 'The API key may be invalid or not authorized. Please check your DFLOW_API_KEY.' : undefined,
    });
  }
});

// Search events from Dflow
router.get('/dflow/search', async (req, res) => {
  try {
    const { q, sort, order, limit, cursor, withNestedMarkets, withMarketAccounts } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const result = await dflowService.searchEvents({
      q,
      sort: sort as 'volume' | 'volume24h' | 'liquidity' | 'openInterest' | 'startDate' | undefined,
      order: order as 'asc' | 'desc' | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      cursor: cursor ? parseInt(cursor as string) : undefined,
      withNestedMarkets: withNestedMarkets === 'true' ? true : withNestedMarkets === 'false' ? false : undefined,
      withMarketAccounts: withMarketAccounts === 'true' ? true : withMarketAccounts === 'false' ? false : undefined,
    });

    res.json({
      success: true,
      events: result.events,
      cursor: result.cursor,
    });
  } catch (error) {
    console.error('Dflow search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      success: false,
      error: 'Failed to search events from Dflow API',
      message: errorMessage,
    });
  }
});

// Get single event by ID from Dflow
router.get('/dflow/event/:id', async (req, res) => {
  try {
    const { withNestedMarkets, withMarketAccounts } = req.query;
    const eventId = req.params.id;

    // Build cache key with query params
    const cacheKey = `dflow:event:${eventId}:${withNestedMarkets || 'default'}:${withMarketAccounts || 'default'}`;

    // Use cache with 30-minute TTL (same as Kalshi)
    const event = await kalshiCache.fetch(
      cacheKey,
      async () => {
        return await dflowService.getEventById(
          eventId,
          withNestedMarkets === 'true' ? true : withNestedMarkets === 'false' ? false : undefined,
          withMarketAccounts === 'true' ? true : withMarketAccounts === 'false' ? false : undefined
        );
      },
      {
        useStaleOnError: true, // Use cached data as fallback
      }
    );

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event from Dflow API',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get event candlesticks from Dflow
router.get('/dflow/events/:ticker/candlesticks', async (req, res) => {
  try {
    const { ticker } = req.params;
    const { startTs, endTs, periodInterval } = req.query;

    if (!startTs || !endTs || !periodInterval) {
      return res.status(400).json({
        success: false,
        error: 'startTs, endTs, and periodInterval are required',
      });
    }

    const params = {
      startTs: parseInt(startTs as string),
      endTs: parseInt(endTs as string),
      periodInterval: parseInt(periodInterval as string),
    };

    // Use cache for event candlesticks
    const candlesticks = await candlestickCache.fetch(
      'event',
      ticker,
      params,
      () => dflowService.getEventCandlesticks(ticker, params)
    );

    res.json({
      success: true,
      data: candlesticks,
    });
  } catch (error) {
    console.error('Dflow event candlesticks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event candlesticks from Dflow API',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get market candlesticks from Dflow (individual market ticker)
router.get('/dflow/market/:ticker/candlesticks', async (req, res) => {
  try {
    const { ticker } = req.params;
    const { startTs, endTs, periodInterval } = req.query;

    if (!startTs || !endTs || !periodInterval) {
      return res.status(400).json({
        success: false,
        error: 'startTs, endTs, and periodInterval are required',
      });
    }

    const params = {
      startTs: parseInt(startTs as string),
      endTs: parseInt(endTs as string),
      periodInterval: parseInt(periodInterval as string),
    };

    // Use cache for market candlesticks
    const candlesticks = await candlestickCache.fetch(
      'market',
      ticker,
      params,
      () => dflowService.getMarketCandlesticks(ticker, params)
    );

    res.json({
      success: true,
      data: candlesticks,
    });
  } catch (error) {
    console.error('Dflow market candlesticks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market candlesticks from Dflow API',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Test route
router.get('/dflow/test-orderbook', async (req, res) => {
  res.json({ success: true, message: 'Test route works!' });
});

// Get orderbook by mint address from Dflow
router.get('/dflow/orderbook/:mintAddress', async (req, res) => {
  console.log('Orderbook route hit with mintAddress:', req.params.mintAddress);
  console.log('Incoming request info:', { method: req.method, originalUrl: req.originalUrl, headers: req.headers, query: req.query });
  try {
    const { mintAddress } = req.params;

    const orderbook = await dflowService.getOrderbook(mintAddress);

    // Cast to any to safely access dynamic Dflow fields without TS errors
    const ob: any = orderbook as any;

    console.log('Dflow returned orderbook for', mintAddress, 'type:', typeof orderbook, 'keys:', orderbook && typeof orderbook === 'object' ? Object.keys(orderbook).slice(0,20) : null);

    if (!orderbook) {
      console.warn('Dflow returned empty orderbook for', mintAddress);
      return res.status(404).json({ success: false, error: 'Orderbook not found' });
    }

    // Normalize orderbook: move yes_bids into bids, and convert no_bids into asks by mapping price -> (1 - price)
    const bids = ob.yes_bids || ob.bids || {};
    const noBids = ob.no_bids || {};
     const asks: Record<string, number> = {};

     for (const [priceStr, amount] of Object.entries(noBids)) {
       const parsed = parseFloat(priceStr);
       if (!Number.isFinite(parsed)) continue;

       const yesPrice = 1 - parsed; // convert 'no' bid price to 'yes' ask price
       const key = yesPrice.toFixed(4);
       const numericAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
       asks[key] = (asks[key] || 0) + numericAmount; // sum if collisions occur due to rounding
     }

     const normalized = {
      sequence: ob.sequence,
      bids,
      asks,
      raw: ob,
     };

     res.json({
       success: true,
       data: normalized,
     });
  } catch (error) {
    console.error('Dflow orderbook error:', error instanceof Error ? error.message : error);
    // Echo Dflow API error details if present
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orderbook from Dflow API',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get event data from Kalshi API
router.get('/kalshi/events/:eventTicker', async (req, res) => {
  try {
    const { eventTicker } = req.params;
    const { with_nested_markets } = req.query;

    // Build cache endpoint key
    const cacheEndpoint = `events/${eventTicker}${with_nested_markets === 'true' ? '?with_nested_markets=true' : ''}`;

    console.log('Fetching Kalshi event:', eventTicker, 'with_nested_markets:', with_nested_markets);

    // Use cache with fallback
    const data = await kalshiCache.fetch(
      cacheEndpoint,
      async () => {
        // Build Kalshi API URL with query params
        const kalshiApiUrl = new URL(`https://api.elections.kalshi.com/trade-api/v2/events/${eventTicker}`);
        if (with_nested_markets === 'true') {
          kalshiApiUrl.searchParams.append('with_nested_markets', 'true');
        }

        const response = await fetch(kalshiApiUrl.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Kalshi API error: ${response.status} ${response.statusText}`);
        }

        return await response.json() as any;
      },
      {
        useStaleOnError: true, // Use cached data as fallback on rate limit/error
      }
    );

    res.json({
      success: true,
      event: data.event,
      markets: data.markets,
    });
  } catch (error) {
    console.error('Kalshi event error:', error instanceof Error ? error.message : error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event from Kalshi API',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get event metadata from Kalshi API
router.get('/kalshi/events/:eventTicker/metadata', async (req, res) => {
  try {
    const { eventTicker } = req.params;

    console.log('Fetching Kalshi metadata for event:', eventTicker);

    // Use cache with fallback
    const data = await kalshiCache.fetch(
      `events/${eventTicker}/metadata`,
      async () => {
        const kalshiApiUrl = `https://api.elections.kalshi.com/trade-api/v2/events/${eventTicker}/metadata`;

        const response = await fetch(kalshiApiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Kalshi API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      },
      {
        useStaleOnError: true, // Use cached data as fallback
      }
    );

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Kalshi metadata error:', error instanceof Error ? error.message : error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metadata from Kalshi API',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Cache management endpoints
// Clear cache for a specific event
router.delete('/cache/kalshi/events/:eventTicker', async (req, res) => {
  try {
    const { eventTicker } = req.params;

    // Invalidate both with and without nested markets
    await kalshiCache.invalidate(`events/${eventTicker}`);
    await kalshiCache.invalidate(`events/${eventTicker}?with_nested_markets=true`);
    await kalshiCache.invalidate(`events/${eventTicker}/metadata`);

    res.json({
      success: true,
      message: `Cache cleared for event ${eventTicker}`,
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

// Clear all Kalshi cache
router.delete('/cache/kalshi/all', async (req, res) => {
  try {
    await kalshiCache.clearAll();

    res.json({
      success: true,
      message: 'All Kalshi cache cleared',
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
});

// Get cache info for debugging
router.get('/cache/kalshi/events/:eventTicker/info', async (req, res) => {
  try {
    const { eventTicker } = req.params;
    const { with_nested_markets } = req.query;

    const endpoint = `events/${eventTicker}${with_nested_markets === 'true' ? '?with_nested_markets=true' : ''}`;
    const info = await kalshiCache.getCacheInfo(endpoint);

    res.json({
      success: true,
      endpoint,
      ...info,
    });
  } catch (error) {
    console.error('Cache info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache info',
    });
  }
});

// Save an event ticker to MongoDB
router.post('/events', authenticateAdmin, async (req, res) => {
  try {
    console.log('Received save event request:', req.body);
    const { ticker, imageUrl } = req.body;

    if (!ticker) {
      console.log('Ticker validation failed - no ticker provided');
      return res.status(400).json({
        success: false,
        error: 'Ticker is required',
      });
    }

    console.log('Checking if event exists with ticker:', ticker);
    // Check if event already exists
    const existingEvent = await Event.findOne({ ticker });
    if (existingEvent) {
      console.log('Event already exists:', existingEvent);
      return res.status(409).json({
        success: false,
        error: 'Event with this ticker already exists',
      });
    }

    // Fetch event details from Kalshi API to get title, markets, and imageUrl
    console.log('Fetching event details from Kalshi API...');
    let eventTitle = undefined;
    let markets = [];
    let fetchedImageUrl = imageUrl; // Start with provided imageUrl

    try {
      const kalshiApiUrl = new URL(`https://api.elections.kalshi.com/trade-api/v2/events/${ticker}`);
      kalshiApiUrl.searchParams.append('with_nested_markets', 'true');

      const kalshiResponse = await fetch(kalshiApiUrl.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (kalshiResponse.ok) {
        const kalshiData: any = await kalshiResponse.json();
        eventTitle = kalshiData.event?.title;

        // Extract market tickers and titles
        if (kalshiData.event?.markets && Array.isArray(kalshiData.event.markets)) {
          markets = kalshiData.event.markets.map((market: any) => ({
            ticker: market.ticker,
            title: market.subtitle || market.title || market.ticker,
          }));
        } else if (kalshiData.markets && Array.isArray(kalshiData.markets)) {
          markets = kalshiData.markets.map((market: any) => ({
            ticker: market.ticker,
            title: market.subtitle || market.title || market.ticker,
          }));
        }

        // Get imageUrl from metadata if not provided
        if (!fetchedImageUrl) {
          try {
            const metadataUrl = `https://api.elections.kalshi.com/trade-api/v2/events/${ticker}/metadata`;
            const metadataResponse = await fetch(metadataUrl, {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
            });

            if (metadataResponse.ok) {
              const metadataData: any = await metadataResponse.json();
              fetchedImageUrl = metadataData.event?.image_url || metadataData.image_url;
              console.log('Fetched imageUrl from metadata:', fetchedImageUrl);
            }
          } catch (metadataError) {
            console.warn('Error fetching metadata:', metadataError);
          }
        }

        console.log('Fetched event title:', eventTitle);
        console.log('Fetched markets:', markets.length);
        console.log('Final imageUrl:', fetchedImageUrl);
      } else {
        console.warn('Failed to fetch from Kalshi API, saving without title/markets');
      }
    } catch (fetchError) {
      console.warn('Error fetching from Kalshi API:', fetchError);
      // Continue saving without title/markets
    }

    console.log('Creating new event with ticker:', ticker, 'title:', eventTitle, 'markets:', markets.length);
    const event = new Event({
      ticker,
      title: eventTitle,
      imageUrl: fetchedImageUrl || undefined,
      markets: markets.length > 0 ? markets : undefined,
    });

    console.log('Saving event to database...');
    await event.save();
    console.log('Event saved successfully:', event);

    res.status(201).json({
      success: true,
      message: 'Event saved successfully',
      event,
    });
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save event',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all saved events with pagination
router.get('/events', async (req, res) => {
  try {
    const { limit, offset, includeInactive } = req.query;

    // Parse pagination parameters
    const limitNum = limit ? parseInt(limit as string) : undefined;
    const offsetNum = offset ? parseInt(offset as string) : 0;
    const showInactive = includeInactive === 'true';

    // Build filter - by default only show active events
    // Use $ne: false to include events without the active field (treat as active)
    const filter = showInactive ? {} : { active: { $ne: false } };

    // Get total count
    const total = await Event.countDocuments(filter);

    // Build query with pagination
    let query = Event.find(filter).sort({ createdAt: -1 }).skip(offsetNum);

    if (limitNum) {
      query = query.limit(limitNum);
    }

    const events = await query;

    res.json({
      success: true,
      count: events.length,
      total,
      events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Search events by title (event title or market titles)
router.get('/events/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.json({
        success: true,
        results: [],
      });
    }

    const query = q.trim();

    // Use regex for partial word matching (case-insensitive)
    const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    // Search in event title or market titles (only active events)
    // Use $ne: false to include events without the active field (treat as active)
    const events = await Event.find({
      active: { $ne: false },
      $or: [
        { title: searchRegex },
        { 'markets.title': searchRegex }
      ]
    })
      .limit(20)
      .select('ticker title imageUrl markets.ticker markets.title');

    // Format results for frontend
    const results = events.flatMap(event => {
      const matches = [];

      // Check if event title matches
      if (event.title && event.title.toLowerCase().includes(query.toLowerCase())) {
        matches.push({
          ticker: event.ticker,
          title: event.title,
          type: 'event',
          imageUrl: event.imageUrl,
        });
      }

      // Check if any market title matches
      if (event.markets && Array.isArray(event.markets)) {
        event.markets.forEach((market: any) => {
          if (market.title && market.title.toLowerCase().includes(query.toLowerCase())) {
            matches.push({
              ticker: market.ticker,
              title: market.title,
              type: 'market',
              eventTicker: event.ticker,
              eventTitle: event.title,
              imageUrl: event.imageUrl,
            });
          }
        });
      }

      return matches;
    });

    // Remove duplicates and limit results
    const uniqueResults = Array.from(
      new Map(results.map(item => [item.ticker, item])).values()
    ).slice(0, 10);

    res.json({
      success: true,
      results: uniqueResults,
    });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search events',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get saved events by tickers (for fetching imageUrls)
router.post('/events/by-tickers', async (req, res) => {
  try {
    const { tickers } = req.body;

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return res.json({
        success: true,
        events: [],
      });
    }

    // Fetch events from database
    const events = await Event.find({
      ticker: { $in: tickers }
    }).select('ticker title imageUrl');

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Error fetching events by tickers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Check if event exists by ticker
router.get('/events/check/:ticker', async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const event = await Event.findOne({ ticker });

    console.log(`Checking event with ticker: ${ticker}, found:`, !!event);
    if (event) {
      console.log(`Event imageUrl:`, event.imageUrl);
    }

    res.json({
      success: true,
      exists: !!event,
      event: event || null,
    });
  } catch (error) {
    console.error('Error checking event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check event',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update an event's imageURL
router.put('/events/:ticker', authenticateAdmin, async (req, res) => {
  try {
    const { ticker } = req.params;
    const { imageUrl } = req.body;

    // Build update object with only provided fields
    const updateFields: any = {};
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'imageUrl is required',
      });
    }

    const event = await Event.findOneAndUpdate(
      { ticker },
      updateFields,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete an event by ticker
// Migration: Set active=true on all events without the field
router.post('/admin/migrate-active-field', authenticateAdmin, async (req, res) => {
  try {
    const result = await Event.updateMany(
      { active: { $exists: false } },
      { $set: { active: true } }
    );

    res.json({
      success: true,
      message: 'Migration completed',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error running migration:', error);
    res.status(500).json({
      success: false,
      error: 'Migration failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Toggle event active status
router.patch('/events/:ticker/active', authenticateAdmin, async (req, res) => {
  try {
    const event = await Event.findOne({ ticker: req.params.ticker });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // Toggle active status
    event.active = !event.active;
    await event.save();

    // Invalidate Redis cache for this event
    const ticker = req.params.ticker;
    await Promise.all([
      kalshiCache.invalidate(`events/${ticker}`),
      kalshiCache.invalidate(`events/${ticker}?with_nested_markets=true`),
      kalshiCache.invalidate(`events/${ticker}/metadata`),
    ]);
    console.log(`🗑️  Cleared cache for ${event.active ? 'activated' : 'deactivated'} event: ${ticker}`);

    res.json({
      success: true,
      message: `Event ${event.active ? 'activated' : 'deactivated'} successfully`,
      event,
    });
  } catch (error) {
    console.error('Error toggling event active status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle active status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.delete('/events/:ticker', authenticateAdmin, async (req, res) => {
  try {
    // Hard delete: permanently remove from database
    const event = await Event.findOneAndDelete({ ticker: req.params.ticker });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // Remove deleted event's ticker from all categories
    await Category.updateMany(
      { tickers: req.params.ticker },
      { $pull: { tickers: req.params.ticker } }
    );

    res.json({
      success: true,
      message: 'Event deleted permanently',
      event,
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get trades for markets
router.get('/trades', async (req, res) => {
  try {
    const { ticker, limit = '10', cursor, minTs, maxTs } = req.query;

    // Validate ticker is provided
    if (!ticker || typeof ticker !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Market ticker is required',
      });
    }

    // Call DFlow API to get trades
    const trades = await dflowService.getTrades({
      ticker,
      limit: parseInt(limit as string, 10),
      cursor: cursor as string | undefined,
      minTs: minTs ? parseInt(minTs as string, 10) : undefined,
      maxTs: maxTs ? parseInt(maxTs as string, 10) : undefined,
    });

    res.json({
      success: true,
      trades: trades || [],
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trades',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get DFlow quote only (no transaction)
// Uses /order endpoint WITHOUT userPublicKey to get just a quote
router.get('/dflow/quote', async (req, res) => {
  try {
    const { inputMint, outputMint, amount, slippageBps, predictionMarketSlippageBps } = req.query;

    // Validate required parameters
    if (!inputMint || !outputMint || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: inputMint, outputMint, amount',
      });
    }

    const queryParams = new URLSearchParams({
      inputMint: inputMint as string,
      outputMint: outputMint as string,
      amount: amount as string,
      // For prediction markets, use predictionMarketSlippageBps (not slippageBps)
      predictionMarketSlippageBps: (predictionMarketSlippageBps || '100') as string,
    });

    const DFLOW_QUOTE_API_URL = process.env.DFLOW_QUOTE_API_URL || 'https://c.quote-api.dflow.net';
    const DFLOW_API_KEY = process.env.DFLOW_API_KEY;

    const headers: Record<string, string> = {};
    if (DFLOW_API_KEY) {
      headers['x-api-key'] = DFLOW_API_KEY;
    }

    // Use /order endpoint without userPublicKey to get just a quote
    console.log('Fetching DFlow quote:', `${DFLOW_QUOTE_API_URL}/order?${queryParams.toString()}`);

    const response = await fetch(
      `${DFLOW_QUOTE_API_URL}/order?${queryParams.toString()}`,
      { headers }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DFlow quote API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const quoteData = await response.json() as {
      inAmount: string;
      outAmount: string;
      priceImpactPct: string;
      platformFee?: any;
      slippageBps: number;
      inputMint: string;
      outputMint: string;
      minOutAmount: string;
      otherAmountThreshold: string;
    };

    res.json({
      success: true,
      quote: {
        inAmount: quoteData.inAmount,
        outAmount: quoteData.outAmount,
        priceImpactPct: quoteData.priceImpactPct,
        platformFee: quoteData.platformFee,
        slippageBps: quoteData.slippageBps,
        inputMint: quoteData.inputMint,
        outputMint: quoteData.outputMint,
        minOutAmount: quoteData.minOutAmount,
        otherAmountThreshold: quoteData.otherAmountThreshold,
      },
    });
  } catch (error) {
    console.error('DFlow quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get DFlow order (quote + transaction)
router.get('/dflow/order', async (req, res) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Required parameters
    const requiredParams = ['userPublicKey', 'inputMint', 'outputMint', 'amount'];
    for (const param of requiredParams) {
      const value = req.query[param];
      if (!value) {
        return res.status(400).json({
          success: false,
          error: `Missing required parameter: ${param}`,
        });
      }
      queryParams.append(param, value as string);
    }

    // Optional parameters
    const optionalParams = [
      'slippageBps',
      'predictionMarketSlippageBps',
      'wrapAndUnwrapSol',
      'prioritizationFeeLamports',
      'dexes',
      'excludeDexes',
      'onlyDirectRoutes',
      'maxRouteLength',
      'platformFeeBps',
      'feeAccount',
      'destinationTokenAccount',
      'revertWallet',
    ];

    for (const param of optionalParams) {
      const value = req.query[param];
      if (value !== undefined) {
        queryParams.append(param, value as string);
      }
    }

    const DFLOW_API_URL = process.env.DFLOW_API_URL || 'https://quote-api.dflow.net';
    const DFLOW_API_KEY = process.env.DFLOW_API_KEY;

    const headers: Record<string, string> = {};
    if (DFLOW_API_KEY) {
      headers['x-api-key'] = DFLOW_API_KEY;
    }

    console.log('Fetching DFlow order:', `${DFLOW_API_URL}/order?${queryParams.toString()}`);

    const response = await fetch(`${DFLOW_API_URL}/order?${queryParams.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DFlow order error:', response.status, errorText);
      return res.status(response.status).json({
        success: false,
        error: `DFlow API error: ${response.status} ${response.statusText}`,
        details: errorText,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('DFlow order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order from DFlow API',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get DFlow order status
router.get('/dflow/order-status', async (req, res) => {
  try {
    const { signature } = req.query;

    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Transaction signature is required',
      });
    }

    const DFLOW_API_URL = process.env.DFLOW_API_URL || 'https://quote-api.dflow.net';
    const DFLOW_API_KEY = process.env.DFLOW_API_KEY;

    const headers: Record<string, string> = {};
    if (DFLOW_API_KEY) {
      headers['x-api-key'] = DFLOW_API_KEY;
    }

    console.log('Fetching DFlow order status:', signature);

    const response = await fetch(`${DFLOW_API_URL}/order-status?signature=${signature}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DFlow order status error:', response.status, errorText);
      return res.status(response.status).json({
        success: false,
        error: `DFlow API error: ${response.status} ${response.statusText}`,
        details: errorText,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('DFlow order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order status from DFlow API',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Execute trade - sign and submit transaction
router.post('/dflow/execute-trade',
  authenticateToken,
  tradeRateLimiter,
  tradeIdempotencyMiddleware,
  tradeLockMiddleware,
  async (req, res) => {
  try {
    console.log('🚀 Execute trade called:', {
      body: req.body,
      userId: (req as any).user?.id
    });

    // Unique id for this trade (thread safe in case of horizontal scaling)
    // Only completed trades are saved to DB
    // Errors before completion mean no DB record, simply log and return error
    const tradeId = uuidv4();
    const timestamps: Record<string, number> = {
      requestReceivedAt: Date.now(),
      quoteReceivedAt: 0,
      signedAt: 0,
      txSubmittedAt: 0,
      feeCollectedAt: 0,
    };

    const {
      inputMint,
      outputMint,
      amount,
      slippageBps,
      predictionMarketSlippageBps,
      ticker,
      marketTitle,
      eventTitle,
      eventTicker,
      side,
      outcome,
      platformFee
    } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Validate inputs
    if (!inputMint || !outputMint || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: inputMint, outputMint, amount'
      });
    }

    // Check geoblocking
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
               req.headers['x-real-ip']?.toString() ||
               req.socket.remoteAddress ||
               'unknown';

    console.log('🌍 Checking geoblocking for trade from IP:', ip);

    // Skip geolocation for local IPs
    if (ip !== 'unknown' && ip !== '::1' && !ip.startsWith('127.') && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json() as { status: string; countryCode: string };
          if (geoData.status === 'success') {
            const geoblock = await GeoBlock.findOne({ countryCode: geoData.countryCode });
            if (geoblock) {
              console.log('🚫 Trade blocked - user in geoblocked country:', geoData.countryCode);
              return res.status(403).json({
                success: false,
                error: 'Trading is not available in your location',
                geoblocked: true
              });
            }
          }
        }
      } catch (geoError) {
        console.error('Geolocation check failed:', geoError);
        // Fail open - allow trade if geolocation check fails
      }
    }

    // Check if this is a SELL trade (inputMint is not USDC)
    const isSellTrade = inputMint !== USDC_MINT;

    if (isSellTrade) {
      // For sell trades, verify user has sufficient balance of the outcome token
      console.log('💰 Validating sell trade - checking user positions...');

      const user = await User.findById(userId);
      if (!user || !user.publicKey) {
        return res.status(404).json({ success: false, error: 'Wallet not found' });
      }

      // Fetch user's token accounts for the specific mint
      const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          new PublicKey(user.publicKey),
          { programId: TOKEN_2022_PROGRAM_ID }
        );

        // Find the specific token account for the mint being sold
        const accountForMint = tokenAccounts.value.find((account) => {
          const parsedInfo = account.account.data.parsed.info;
          return parsedInfo.mint === inputMint;
        });

        if (!accountForMint) {
          console.log('❌ User has no balance for mint:', inputMint);
          return res.status(400).json({
            success: false,
            error: 'No contracts to sell',
            message: 'You do not have any shares of this outcome token'
          });
        }

        const tokenBalance = accountForMint.account.data.parsed.info.tokenAmount.uiAmount;
        const requiredAmount = amount / 1_000_000; // Convert from smallest units to decimals

        console.log(`💵 User balance for ${inputMint.slice(0, 8)}...: ${tokenBalance}, required: ${requiredAmount}`);

        if (tokenBalance < requiredAmount) {
          return res.status(400).json({
            success: false,
            error: 'Insufficient shares',
            message: `You need ${Math.ceil(requiredAmount)} shares but only have ${Math.floor(tokenBalance)} shares`
          });
        }

        console.log('✅ User has sufficient balance for sell trade');
      } catch (balanceError) {
        console.error('❌ Error checking token balance:', balanceError);
        return res.status(500).json({
          success: false,
          error: 'Failed to verify token balance',
          message: balanceError instanceof Error ? balanceError.message : 'Unknown error'
        });
      }
    }

    // Platform fee: $0.50 to cover sponsor wallet costs (~$0.46 per trade)
    const PLATFORM_FEE_USDC = 0.50;
    const platformFeeAmount = Math.floor(PLATFORM_FEE_USDC * 1_000_000); // Convert to USDC decimals

    // 1. Get user wallet and check balance
    const user = await User.findById(userId);
    if (!user || !user.encryptedPrivateKey) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    if (!user.publicKey) {
      return res.status(400).json({ success: false, error: 'User wallet not initialized' });
    }

    // Decrypt user private key
    const userPrivateKeyBytes = decryptPrivateKey(
      user.encryptedPrivateKey,
      user.iv!,
      user.authTag!
    );

    // 2. Load sponsor wallet for gasless trading
    const sponsorWallet = loadSponsorWallet();
    if (!sponsorWallet) {
      return res.status(500).json({
        success: false,
        error: 'Sponsor wallet not configured. Gasless trading unavailable.'
      });
    }

    // 3. Get order from DFlow with sponsor for gasless trading
    // Note: Prediction markets use async execution (escrow accounts ~$0.46 per trade)
    // Both allowSyncExec and allowAsyncExec default to true, so DFlow chooses best execution mode
    const queryParams = new URLSearchParams({
      userPublicKey: user.publicKey,
      sponsor: sponsorWallet.publicKey.toString(), // Sponsor pays gas fees
      inputMint,
      outputMint,
      amount: amount.toString(),
      predictionMarketSlippageBps: (predictionMarketSlippageBps || 100).toString(),
      wrapAndUnwrapSol: 'true',
      prioritizationFeeLamports: 'auto'
    });

    const DFLOW_QUOTE_API_URL = process.env.DFLOW_QUOTE_API_URL || 'https://c.quote-api.dflow.net';
    const DFLOW_API_KEY = process.env.DFLOW_API_KEY;

    const headers: Record<string, string> = {};
    if (DFLOW_API_KEY) {
      headers['x-api-key'] = DFLOW_API_KEY;
    }

    console.log('Fetching DFlow order:', `${DFLOW_QUOTE_API_URL}/order?${queryParams.toString()}`);

    const orderResponse = await fetch(
      `${DFLOW_QUOTE_API_URL}/order?${queryParams.toString()}`,
      { headers }
    );

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({}));
      throw new Error(`DFlow API error: ${orderResponse.status} ${JSON.stringify(errorData)}`);
    }

    const orderData = await orderResponse.json() as {
      transaction: string;
      executionMode: string;
      outAmount: string;
      inAmount: string;
      priceImpactPct: string;
    };

    timestamps.quoteReceivedAt = Date.now();

    // Validate trade profitability for BUY orders
    // For BUY: inAmount is USDC spent, outAmount is contracts received
    // Max payout per contract = $1.00, so max payout = outAmount / 1_000_000
    if (inputMint === USDC_MINT && side === 'buy') {
      const usdcSpent = parseInt(orderData.inAmount, 10) / 1_000_000;
      const contractsReceived = parseInt(orderData.outAmount, 10) / 1_000_000;
      const maxPayout = contractsReceived; // Each contract pays max $1.00
      const totalCost = usdcSpent + PLATFORM_FEE_USDC;

      console.log('🔍 Trade validation:', {
        usdcSpent: usdcSpent.toFixed(2),
        contractsReceived: contractsReceived.toFixed(2),
        maxPayout: maxPayout.toFixed(2),
        platformFee: PLATFORM_FEE_USDC,
        totalCost: totalCost.toFixed(2)
      });

      if (maxPayout < totalCost) {
        return res.status(400).json({
          success: false,
          error: 'Unprofitable trade',
          message: `Maximum payout ($${maxPayout.toFixed(2)}) is less than total cost ($${totalCost.toFixed(2)}). This trade would result in a guaranteed loss.`
        });
      }
    }

    // Note: Balance check removed - Dflow API will reject insufficient balance
    // This eliminates the race condition window from HTTP balance checks

    // 4. Sign the transaction with BOTH user and sponsor (gasless)
    const userKeypair = Keypair.fromSecretKey(userPrivateKeyBytes);
    const transactionBuffer = Buffer.from(orderData.transaction, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuffer);

    // Sign with both user and sponsor keypairs for gasless trading
    transaction.sign([userKeypair, sponsorWallet]);

    timestamps.signedAt = Date.now();

    console.log('✅ Transaction signed by user and sponsor (gasless)');

    // 5. Submit to Solana
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const signature = await connection.sendTransaction(transaction);

    timestamps.txSubmittedAt = Date.now();

    // For sell orders, wait for confirmation before collecting fee
    if (side === 'sell' && orderData.executionMode === 'sync') {
      try {
        console.log('⏳ Waiting for sell transaction confirmation before collecting fee...');
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');

        await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        }, 'confirmed');

        console.log('✅ Sell transaction confirmed');
      } catch (confirmError) {
        console.warn('⚠️ Confirmation timeout for sell trade:', confirmError);
        // If confirmation fails, don't collect fee for sell orders
        return res.status(400).json({
          success: false,
          error: 'Transaction confirmation failed. Fee not collected.',
          signature
        });
      }
    }

    // 6. Collect platform fee (transfer $0.50 USDC from user to sponsor wallet to cover costs)
    // For buy orders: collected immediately after submission
    // For sell orders: collected after confirmation (or immediately for async mode)
    let platformFeeSignature: string | undefined;
    try {
      console.log('💰 Collecting $0.50 platform fee...');
      const userKeypair = Keypair.fromSecretKey(userPrivateKeyBytes);

      // Import needed SPL token functions
      const { getAssociatedTokenAddress: getATA, createTransferInstruction } = await import('@solana/spl-token');
      const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

      const usdcMint = new PublicKey(USDC_MINT);
      const userUsdcAccount = await getATA(usdcMint, userKeypair.publicKey);
      const sponsorUsdcAccount = await getATA(usdcMint, sponsorWallet.publicKey);

      const feeTransferIx = createTransferInstruction(
        userUsdcAccount,
        sponsorUsdcAccount,
        userKeypair.publicKey,
        platformFeeAmount
      );

      const feeTx = new Transaction().add(feeTransferIx);
      const { blockhash } = await connection.getLatestBlockhash();
      feeTx.recentBlockhash = blockhash;
      feeTx.feePayer = sponsorWallet.publicKey; // Sponsor pays tx fee

      // Both sign (user authorizes USDC transfer, sponsor pays tx fee)
      feeTx.sign(userKeypair, sponsorWallet);

      platformFeeSignature = await connection.sendRawTransaction(feeTx.serialize());

      timestamps.feeCollectedAt = Date.now();

      console.log('✅ Platform fee collected:', platformFeeSignature);
    } catch (error) {
      console.error('⚠️  Platform fee collection failed:', error);
      // Don't fail the whole trade if fee collection fails
    }

    // Success, we can log the trade to DB
    try {
      await Trade.create({
        internalTradeId: tradeId,
        userId,
        inputMint,
        outputMint,
        inputAmount: parseInt(orderData.inAmount, 10),
        outputAmount: parseInt(orderData.outAmount, 10),
        quotePriceImpactPct: parseFloat(orderData.priceImpactPct),
        slippageBps: slippageBps,
        predictionMarketSlippageBps: predictionMarketSlippageBps,
        solanaSignature: signature,
        platformFeeSignature: platformFeeSignature,
        sponsorPublicKey: sponsorWallet.publicKey.toString(),
        requestReceivedAt: timestamps.requestReceivedAt,
        quoteReceivedAt: timestamps.quoteReceivedAt,
        signedAt: timestamps.signedAt,
        txSubmittedAt: timestamps.txSubmittedAt,
        feeCollectedAt: timestamps.feeCollectedAt,
        platformFeeUSDC: platformFee !== undefined ? platformFee : PLATFORM_FEE_USDC,
        ticker,
        marketTitle,
        eventTitle,
        eventTicker,
        side,
        outcome,
      });
      console.log('✅ Trade logged to DB successfully');
    } catch (dbError) {
      console.error('❌ CRITICAL: Failed to log trade to DB:', {
        tradeId,
        userId,
        signature,
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined
      });
      // Trade executed on Dflow but not recorded - log for manual recovery
    }

    // 7. Return result
    const result = {
      success: true,
      signature,
      platformFee: PLATFORM_FEE_USDC,
      platformFeeSignature,
      gasless: true, // Transaction fee paid by sponsor
      sponsorPublicKey: sponsorWallet.publicKey.toString(),
      executionMode: orderData.executionMode,
      outAmount: orderData.outAmount,
      inAmount: orderData.inAmount,
      priceImpactPct: orderData.priceImpactPct,
      quote: {
        inputAmount: orderData.inAmount,
        outputAmount: orderData.outAmount,
        priceImpact: orderData.priceImpactPct,
        executionMode: orderData.executionMode
      }
    };

    // Cache result for idempotency (prevents duplicate trades)
    await cacheTradeResult(req, result);

    res.json(result);

  } catch (error) {
    console.error('❌ Execute trade error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    res.status(500).json({
      success: false,
      error: 'Failed to execute trade',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    });
  } finally {
    // Always release the lock, even if trade failed
    await releaseTradeLock(req);
  }
});

// Get user's prediction market positions
router.get('/positions', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Positions endpoint called');
    const userId = (req as any).user?.id;
    console.log('User ID:', userId);

    if (!userId) {
      console.log('❌ No user ID found');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // 1. Get user's public key
    const user = await User.findById(userId);
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('User publicKey:', user?.publicKey);
    
    if (!user || !user.publicKey) {
      console.log('❌ No wallet found for user');
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    // 2. Fetch all token accounts owned by the user (using TOKEN_2022_PROGRAM_ID for prediction markets)
    console.log('📡 Fetching token accounts from Solana...');
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    let tokenAccounts;
    try {
      tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(user.publicKey),
        { programId: TOKEN_2022_PROGRAM_ID }
      );
      console.log('✅ Token accounts fetched:', tokenAccounts.value.length);
    } catch (solanaError) {
      console.error('❌ Solana RPC error:', solanaError);
      throw new Error(`Solana RPC failed: ${solanaError instanceof Error ? solanaError.message : 'Unknown error'}`);
    }

    // 3. Filter for non-zero balances
    const nonZeroBalances = tokenAccounts.value
      .map((account) => {
        const parsedInfo = account.account.data.parsed.info;
        return {
          mint: parsedInfo.mint,
          balance: parsedInfo.tokenAmount.uiAmount,
          decimals: parsedInfo.tokenAmount.decimals,
        };
      })
      .filter((token) => token.balance > 0);

    console.log('💰 Non-zero balances:', nonZeroBalances.length);
    console.log('Mint addresses:', nonZeroBalances.map(t => t.mint));

    if (nonZeroBalances.length === 0) {
      console.log('⚠️ No token positions found');
      return res.json({
        success: true,
        positions: [],
        message: 'No token positions found',
      });
    }

    // 4. Filter for prediction market outcome mints
    console.log('🔍 Filtering outcome mints...');
    const METADATA_API_BASE_URL = 'https://c.prediction-markets-api.dflow.net';
    const DFLOW_API_KEY = process.env.DFLOW_API_KEY;

    const allMintAddresses = nonZeroBalances.map((token) => token.mint);

    let filterResponse;
    try {
      filterResponse = await fetch(
        `${METADATA_API_BASE_URL}/api/v1/filter_outcome_mints`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(DFLOW_API_KEY && { 'x-api-key': DFLOW_API_KEY }),
          },
          body: JSON.stringify({ addresses: allMintAddresses }),
        }
      );

      if (!filterResponse.ok) {
        const errorText = await filterResponse.text().catch(() => '');
        console.log('❌ Filter response failed:', filterResponse.status, errorText);
        throw new Error(`Failed to filter outcome mints: ${filterResponse.status} ${errorText}`);
      }
    } catch (fetchError) {
      console.error('❌ DFlow filter API error:', fetchError);
      throw new Error(`DFlow filter API failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }

    const filterData = await filterResponse.json() as { outcomeMints?: string[] };
    const predictionMintAddresses = filterData.outcomeMints || [];
    
    console.log('✅ Prediction mint addresses found:', predictionMintAddresses.length);
    console.log('Prediction mints:', predictionMintAddresses);

    if (predictionMintAddresses.length === 0) {
      console.log('⚠️ No prediction market positions found');
      return res.json({
        success: true,
        positions: [],
        message: 'No prediction market positions found',
      });
    }

    // 5. Get the outcome tokens from user's balances
    const outcomeTokens = nonZeroBalances.filter((token) =>
      predictionMintAddresses.includes(token.mint)
    );

    console.log(`✅ Matched ${outcomeTokens.length} outcome tokens from user's balances`);

    // 6. Fetch market details in batch
    let marketsResponse;
    try {
      marketsResponse = await fetch(
        `${METADATA_API_BASE_URL}/api/v1/markets/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(DFLOW_API_KEY && { 'x-api-key': DFLOW_API_KEY }),
          },
          body: JSON.stringify({ mints: predictionMintAddresses }),
        }
      );

      if (!marketsResponse.ok) {
        const errorText = await marketsResponse.text().catch(() => '');
        console.log('❌ Markets batch response failed:', marketsResponse.status, errorText);
        throw new Error(`Failed to fetch markets batch: ${marketsResponse.status} ${errorText}`);
      }
    } catch (fetchError) {
      console.error('❌ DFlow markets batch API error:', fetchError);
      throw new Error(`DFlow markets batch API failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }

    const marketsData = await marketsResponse.json() as { markets?: any[] };
    const markets = marketsData.markets || [];

    console.log(`✅ Fetched ${markets.length} market details from DFlow`);

    // 7. Create a map by mint address for efficient lookup
    const marketsByMint = new Map<string, any>();
    markets.forEach((market: any) => {
      if (market.accounts && typeof market.accounts === 'object') {
        Object.values(market.accounts).forEach((account: any) => {
          if (account.yesMint) marketsByMint.set(account.yesMint, market);
          if (account.noMint) marketsByMint.set(account.noMint, market);
          if (account.marketLedger) marketsByMint.set(account.marketLedger, market);
        });
      }
    });

    // 8. Map outcome tokens to their market data and determine position type
    const userPositions = outcomeTokens.map((token) => {
      const marketData = marketsByMint.get(token.mint);

      if (!marketData) {
        return {
          mint: token.mint,
          balance: token.balance,
          decimals: token.decimals,
          position: 'UNKNOWN',
          market: null,
          isRedeemable: false,
        };
      }

      // Determine if this is a YES or NO token
      const isYesToken = Object.values(marketData.accounts || {}).some(
        (account: any) => account.yesMint === token.mint
      );

      const isNoToken = Object.values(marketData.accounts || {}).some(
        (account: any) => account.noMint === token.mint
      );

      // Check if position is redeemable
      let isRedeemable = false;
      if (marketData.status === "determined" || marketData.status === "finalized") {
        const result = marketData.result;

        if (marketData.accounts && marketData.accounts[USDC_MINT]) {
          const usdcAccount = marketData.accounts[USDC_MINT];

          if (usdcAccount.redemptionStatus === "open") {
            // Standard determined outcome
            if (result === "yes" || result === "no") {
              if (
                (result === "yes" && usdcAccount.yesMint === token.mint) ||
                (result === "no" && usdcAccount.noMint === token.mint)
              ) {
                isRedeemable = true;
              }
            }
            // Scalar outcome (both YES and NO are redeemable)
            else if (
              result === "" &&
              usdcAccount.scalarOutcomePct !== null &&
              usdcAccount.scalarOutcomePct !== undefined
            ) {
              if (
                usdcAccount.yesMint === token.mint ||
                usdcAccount.noMint === token.mint
              ) {
                isRedeemable = true;
              }
            }
          }
        }
      }

      return {
        mint: token.mint,
        balance: token.balance,
        decimals: token.decimals,
        position: isYesToken ? 'YES' : isNoToken ? 'NO' : 'UNKNOWN',
        isRedeemable,
        market: {
          ticker: marketData.ticker,
          eventTicker: marketData.eventTicker,
          title: marketData.title || marketData.yesSubTitle,
          subtitle: marketData.yesSubTitle,
          category: marketData.category,
          status: marketData.status,
          result: marketData.result,
          volume: marketData.volume,
          openInterest: marketData.openInterest,
          closeTime: marketData.closeTime,
          openTime: marketData.openTime,
          yesAsk: marketData.yesAsk,
          yesBid: marketData.yesBid,
          noAsk: marketData.noAsk,
          noBid: marketData.noBid,
          accounts: marketData.accounts, // Include accounts with mint addresses
        },
      };
    });

    console.log(`✅ Returning ${userPositions.length} positions to client`);
    console.log('Positions summary:', userPositions.map(p => ({
      mint: p.mint,
      balance: p.balance,
      position: p.position,
      marketTicker: p.market?.ticker
    })));

    res.json({
      success: true,
      positions: userPositions,
      count: userPositions.length,
    });

  } catch (error) {
    console.error('❌ Get positions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch positions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Redeem determined prediction market position
router.post('/redeem-position', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 Redeem position endpoint called');
    const userId = (req as any).user?.id;
    const { mint, amount } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!mint || !amount) {
      return res.status(400).json({ success: false, error: 'Missing mint or amount' });
    }

    // Get user's wallet
    const user = await User.findById(userId);
    if (!user || !user.publicKey || !user.encryptedPrivateKey || !user.iv || !user.authTag) {
      return res.status(404).json({ success: false, error: 'Wallet not found or incomplete' });
    }

    // Decrypt user's private key
    const privateKeyBytes = decryptPrivateKey(user.encryptedPrivateKey, user.iv, user.authTag);
    const userKeypair = Keypair.fromSecretKey(privateKeyBytes);

    // Load sponsor wallet for gasless trading
    const sponsorWallet = loadSponsorWallet();
    if (!sponsorWallet) {
      return res.status(500).json({
        success: false,
        error: 'Sponsor wallet not configured. Gasless trading unavailable.'
      });
    }

    console.log('📡 Requesting redemption order from DFlow...');

    // Constants
    const QUOTE_API_BASE_URL = "https://c.quote-api.dflow.net";
    const DFLOW_API_KEY = process.env.DFLOW_API_KEY;

    // Calculate amount in smallest units (6 decimals)
    const amountInSmallestUnits = Math.floor(amount * 1_000_000);

    // Request redemption order from DFlow with sponsor for gasless trading
    const queryParams = new URLSearchParams();
    queryParams.append("userPublicKey", user.publicKey);
    queryParams.append("sponsor", sponsorWallet.publicKey.toString());
    queryParams.append("inputMint", mint);
    queryParams.append("outputMint", USDC_MINT);
    queryParams.append("amount", amountInSmallestUnits.toString());

    const orderResponse = await fetch(
      `${QUOTE_API_BASE_URL}/order?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(DFLOW_API_KEY && { 'x-api-key': DFLOW_API_KEY }),
        },
      }
    );

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text().catch(() => '');
      console.error('❌ DFlow order API error:', orderResponse.status, errorText);
      throw new Error(`Failed to get redemption order: ${orderResponse.status} ${errorText}`);
    }

    const orderData = await orderResponse.json() as {
      executionMode: 'sync' | 'async';
      transaction: string;
      outAmount: number;
      inAmount: number;
    };
    console.log('✅ Redemption order received');
    console.log('Execution mode:', orderData.executionMode);

    // Deserialize the transaction
    const transactionBuffer = Buffer.from(orderData.transaction, 'base64');
    let transaction: VersionedTransaction;

    try {
      transaction = VersionedTransaction.deserialize(transactionBuffer);
    } catch (deserializeError) {
      console.error('❌ Failed to deserialize transaction:', deserializeError);
      throw new Error('Invalid transaction format');
    }

    // Sign the transaction with BOTH user and sponsor keypairs for gasless trading
    transaction.sign([userKeypair, sponsorWallet]);
    console.log('✅ Transaction signed by user and sponsor (gasless)');

    // Submit to Solana
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    const signature = await connection.sendTransaction(transaction);

    console.log('📤 Transaction sent:', signature);

    // Handle based on execution mode
    if (orderData.executionMode === 'sync') {
      // For sync trades: Wait for standard RPC confirmation
      try {
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');

        await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        }, 'confirmed');

        console.log('✅ Sync redemption confirmed:', signature);
      } catch (confirmError) {
        console.warn('⚠️ Confirmation timeout for sync trade:', confirmError);
      }
    } else {
      // For async trades: Return signature for polling
      console.log('📊 Async redemption - client should poll order-status');
    }

    res.json({
      success: true,
      signature,
      executionMode: orderData.executionMode,
      outAmount: orderData.outAmount,
      inAmount: orderData.inAmount,
      message: orderData.executionMode === 'async'
        ? 'Redemption submitted. Please wait while we process your transaction.'
        : 'Redemption transaction confirmed.',
    });

  } catch (error) {
    console.error('❌ Redeem position error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem position',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// ADMIN SPONSOR WALLET ROUTES
// ============================================================================

// Helper function to load sponsor wallet
function loadSponsorWallet(): Keypair | null {
  const sponsorPrivateKey = process.env.SPONSOR_PRIVATE_KEY;

  if (!sponsorPrivateKey) {
    return null;
  }

  try {
    const privateKeyBytes = Buffer.from(sponsorPrivateKey, 'base64');
    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    console.error('Failed to load sponsor wallet:', error);
    return null;
  }
}

// Get sponsor wallet info
router.get('/admin/sponsor-wallet', authenticateAdmin, async (req, res) => {
  try {
    const sponsorWallet = loadSponsorWallet();

    if (!sponsorWallet) {
      return res.json({
        success: true,
        configured: false,
        error: 'Sponsor wallet not configured. Please set SPONSOR_PRIVATE_KEY in .env',
      });
    }

    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    // Get balance
    const balanceLamports = await connection.getBalance(sponsorWallet.publicKey);
    const balanceSOL = balanceLamports / 1_000_000_000;

    // Estimate SOL price (simplified - in production, fetch from an oracle)
    const solPriceUSD = 200; // Placeholder
    const balanceUSD = balanceSOL * solPriceUSD;

    // Cost estimates
    const tradeCostSOL = 0.00005; // ~5000 lamports per trade
    const withdrawalCostSOL = 0.00005;
    const accountCreationCostSOL = 0.00203928; // Rent for token account

    const tradesRemaining = Math.floor(balanceSOL / tradeCostSOL);
    const withdrawalsRemaining = Math.floor(balanceSOL / withdrawalCostSOL);

    // Determine status
    let status: 'healthy' | 'low' | 'critical' | 'empty';
    let needsRefill = false;
    let recommendedRefillAmount = 0;
    let message = '';

    if (balanceSOL === 0) {
      status = 'empty';
      needsRefill = true;
      recommendedRefillAmount = 1.0;
      message = '🔴 Sponsor wallet is empty! Add SOL immediately to enable gasless trading.';
    } else if (balanceSOL < 0.05) {
      status = 'critical';
      needsRefill = true;
      recommendedRefillAmount = 0.5;
      message = '🟠 Critical: Sponsor wallet balance is very low. Refill soon to avoid service interruption.';
    } else if (balanceSOL < 0.1) {
      status = 'low';
      needsRefill = true;
      recommendedRefillAmount = 0.3;
      message = '🟡 Low balance: Consider refilling the sponsor wallet soon.';
    } else {
      status = 'healthy';
      message = '🟢 Sponsor wallet is healthy and ready to sponsor trades.';
    }

    res.json({
      success: true,
      configured: true,
      wallet: {
        publicKey: sponsorWallet.publicKey.toString(),
        balance: {
          lamports: balanceLamports,
          sol: balanceSOL,
          usd: balanceUSD,
        },
        status,
        estimates: {
          tradesRemaining,
          withdrawalsRemaining,
          tradeCostSOL,
          withdrawalCostSOL,
          accountCreationCostSOL,
        },
        health: {
          needsRefill,
          recommendedRefillAmount,
          message,
        },
      },
      network: SOLANA_RPC_URL.includes('devnet') ? 'devnet' : 'mainnet',
    });
  } catch (error) {
    console.error('Sponsor wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sponsor wallet data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get sponsor wallet transactions
router.get('/admin/sponsor-transactions', authenticateAdmin, async (req, res) => {
  try {
    const sponsorWallet = loadSponsorWallet();

    if (!sponsorWallet) {
      return res.status(400).json({
        success: false,
        error: 'Sponsor wallet not configured',
      });
    }

    const { limit = '10' } = req.query;
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    // Fetch transaction signatures
    const signatures = await connection.getSignaturesForAddress(
      sponsorWallet.publicKey,
      { limit: parseInt(limit as string) }
    );

    // Fetch transaction details
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        try {
          const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });

          return {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            type: tx?.meta?.err ? 'failed' : 'success',
            amount: tx?.meta?.postBalances && tx?.meta?.preBalances
              ? (tx.meta.preBalances[0] - tx.meta.postBalances[0]) / 1_000_000_000
              : 0,
          };
        } catch (error) {
          return {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            type: 'unknown',
            amount: 0,
          };
        }
      })
    );

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error('Sponsor transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sponsor transactions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Withdraw from sponsor wallet
router.post('/admin/sponsor-withdraw', authenticateAdmin, async (req, res) => {
  try {
    const sponsorWallet = loadSponsorWallet();

    if (!sponsorWallet) {
      return res.status(400).json({
        success: false,
        error: 'Sponsor wallet not configured',
      });
    }

    const { toAddress, amount } = req.body;

    if (!toAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: toAddress, amount',
      });
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
      });
    }

    // Validate address
    try {
      new PublicKey(toAddress);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Solana address',
      });
    }

    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    // Check balance
    const balance = await connection.getBalance(sponsorWallet.publicKey);
    const balanceSOL = balance / 1_000_000_000;

    if (amountNumber > balanceSOL) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Available: ${balanceSOL.toFixed(4)} SOL`,
      });
    }

    // Create and send transaction
    const toPublicKey = new PublicKey(toAddress);
    const lamports = Math.floor(amountNumber * 1_000_000_000);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sponsorWallet.publicKey,
        toPubkey: toPublicKey,
        lamports,
      })
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [sponsorWallet]
    );

    res.json({
      success: true,
      signature,
      amount: amountNumber,
      to: toAddress,
    });
  } catch (error) {
    console.error('Sponsor withdraw error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to withdraw from sponsor wallet',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get deposit address for sponsor wallet
router.get('/admin/sponsor-deposit-address', authenticateAdmin, async (req, res) => {
  try {
    const sponsorWallet = loadSponsorWallet();

    if (!sponsorWallet) {
      return res.status(400).json({
        success: false,
        error: 'Sponsor wallet not configured',
      });
    }

    res.json({
      success: true,
      depositAddress: sponsorWallet.publicKey.toString(),
    });
  } catch (error) {
    console.error('Sponsor deposit address error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get deposit address',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// ADMIN TRADE ROUTES
// ============================================================================

// Get all trades (admin only)
router.get('/admin/trades', authenticateAdmin, async (req, res) => {
  try {
    const { limit = '50', offset = '0', ticker, userId, side, outcome, startDate, endDate } = req.query;

    // Build query filter
    const filter: any = {};
    if (ticker) filter.ticker = ticker;
    if (userId) filter.userId = userId;
    if (side) filter.side = side;
    if (outcome) filter.outcome = outcome;

    // Date range filter
    if (startDate || endDate) {
      filter.requestReceivedAt = {};
      if (startDate) {
        filter.requestReceivedAt.$gte = parseInt(startDate as string);
      }
      if (endDate) {
        filter.requestReceivedAt.$lte = parseInt(endDate as string);
      }
    }

    // Get total count for pagination
    const total = await Trade.countDocuments(filter);

    // Fetch trades with pagination
    const trades = await Trade.find(filter)
      .sort({ requestReceivedAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    // Fetch user information for trades
    const userIds = [...new Set(trades.map(trade => trade.userId))];
    const users = await User.find({ _id: { $in: userIds } }).select('_id username email publicKey');
    const userMap = new Map(users.map(user => [user._id.toString(), user]));

    // Calculate total volume for all trades matching filter (not just current page)
    const allTradesForVolume = await Trade.find(filter);
    const totalVolume = allTradesForVolume.reduce((sum, trade) => {
      const isBuy = trade.side === 'buy' || trade.inputMint === USDC_MINT;
      const usdcAmount = ((isBuy ? trade.inputAmount : trade.outputAmount) || 0) / 1_000_000;
      const totalAmount = isBuy
        ? usdcAmount + (trade.platformFeeUSDC || 0)
        : usdcAmount;
      return sum + totalAmount;
    }, 0);

    // Format trades with user information
    const formattedTrades = trades.map(trade => {
      const tradeObj = trade.toObject();
      const user = userMap.get(trade.userId);

      // Calculate amounts in decimal form
      const isBuy = trade.side === 'buy' || trade.inputMint === USDC_MINT;
      const shares = ((isBuy ? trade.outputAmount : trade.inputAmount) || 0) / 1_000_000;
      const usdcAmount = ((isBuy ? trade.inputAmount : trade.outputAmount) || 0) / 1_000_000;

      // Add platform fee to amount for buy trades
      const totalAmount = isBuy
        ? usdcAmount + (trade.platformFeeUSDC || 0)
        : usdcAmount;

      // Price per share
      const price = shares > 0 ? usdcAmount / shares : 0;

      return {
        ...tradeObj,
        user: user ? {
          _id: user._id,
          username: user.username,
          email: user.email,
          publicKey: user.publicKey,
        } : null,
        formattedShares: shares.toFixed(2),
        formattedAmount: totalAmount.toFixed(2),
        formattedPrice: price.toFixed(2),
        formattedFee: (trade.platformFeeUSDC || 0).toFixed(2),
        timestamp: trade.requestReceivedAt,
      };
    });

    res.json({
      success: true,
      trades: formattedTrades,
      total,
      totalVolume: totalVolume.toFixed(2),
      hasMore: total > parseInt(offset as string) + trades.length,
    });
  } catch (error) {
    console.error('Admin get trades error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trades',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// COMMENT ROUTES
// ============================================================================

// Get comments for an event
router.get('/comments/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    // Try to get user ID from token (optional)
    let currentUserId: string | null = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET || '';
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        currentUserId = decoded.userId;
      } catch (err) {
        // Token invalid or expired, continue without user context
      }
    }

    // Get all comments for this event (both top-level and replies)
    const comments = await Comment.find({ eventId })
      .populate('userId', 'username email publicKey profilePicture')
      .populate('replyToUserId', 'username email publicKey profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    // Add likes info to each comment and generate signed URLs for profile pictures
    const { StorageService } = await import('../services/storage');
    const commentsWithLikes = await Promise.all(comments.map(async (comment: any) => {
      const commentObj = comment.toObject();

      // Generate signed URL for comment author's profile picture
      if (commentObj.userId?.profilePicture && commentObj.userId.profilePicture.startsWith('profile-pictures/')) {
        commentObj.userId.profilePicture = await StorageService.getSignedUrl(commentObj.userId.profilePicture);
      }

      // Generate signed URL for reply-to user's profile picture
      if (commentObj.replyToUserId?.profilePicture && commentObj.replyToUserId.profilePicture.startsWith('profile-pictures/')) {
        commentObj.replyToUserId.profilePicture = await StorageService.getSignedUrl(commentObj.replyToUserId.profilePicture);
      }

      return {
        ...commentObj,
        likesCount: comment.likes.length,
        isLikedByCurrentUser: currentUserId ? comment.likes.some((id: any) => id.toString() === currentUserId) : false,
      };
    }));

    // Count total comments
    const total = await Comment.countDocuments({ eventId });

    res.json({
      success: true,
      comments: commentsWithLikes,
      total,
      hasMore: total > parseInt(offset as string) + comments.length,
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Post a comment
router.post('/comments', authenticateToken, async (req, res) => {
  try {
    const { eventId, content, replyToCommentId } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!eventId || !content) {
      return res.status(400).json({
        success: false,
        error: 'eventId and content are required',
      });
    }

    // Rate limit: max 30 comments + replies per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await Comment.countDocuments({
      userId,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentCount >= 30) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit reached. You can post up to 30 comments and replies per hour.',
      });
    }

    let parentId: mongoose.Types.ObjectId | null = null;
    let replyToUserId: mongoose.Types.ObjectId | null = null;

    // If replying to another comment, determine the structure
    if (replyToCommentId) {
      const replyToComment = await Comment.findById(replyToCommentId);

      if (replyToComment) {
        // If replying to a top-level comment, make it the parent
        if (!replyToComment.parentId) {
          parentId = replyToComment._id;
          replyToUserId = null;
        } else {
          // If replying to a reply, use the same parent but tag the user
          parentId = replyToComment.parentId;
          replyToUserId = replyToComment.userId;
        }
      }
    }

    // Create comment
    const comment = await Comment.create({
      userId,
      eventId,
      content: content.trim(),
      ...(parentId && { parentId }),
      ...(replyToUserId && { replyToUserId }),
    });

    // Populate user data before returning
    await comment.populate([
      { path: 'userId', select: 'username email publicKey' },
      { path: 'replyToUserId', select: 'username email publicKey' },
      { path: 'parentId', select: 'content createdAt userId' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      comment,
    });
  } catch (error) {
    console.error('Post comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to post comment',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete a comment
router.delete('/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Find comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
      });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own comments',
      });
    }

    // Delete the comment and its replies
    await Comment.deleteMany({
      $or: [
        { _id: commentId },
        { parentId: commentId }
      ]
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Like a comment
router.post('/comments/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
      });
    }

    // Check if user already liked the comment
    const alreadyLiked = comment.likes.some((id: any) => id.toString() === userId.toString());

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        error: 'You already liked this comment',
      });
    }

    // Add user to likes array
    comment.likes.push(userId);
    await comment.save();

    res.json({
      success: true,
      likes: comment.likes.length,
      message: 'Comment liked successfully',
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like comment',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Unlike a comment
router.delete('/comments/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
      });
    }

    // Remove user from likes array
    comment.likes = comment.likes.filter((id: any) => id.toString() !== userId.toString());
    await comment.save();

    res.json({
      success: true,
      likes: comment.likes.length,
      message: 'Comment unliked successfully',
    });
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike comment',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get user's trade history
router.get('/trades/user', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 User trades endpoint called');
    const userId = (req as any).user?.id;

    if (!userId) {
      console.log('❌ No user ID found');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Fetch all trades for this user, sorted by most recent first
    const trades = await Trade.find({ userId })
      .sort({ requestReceivedAt: -1 })
      .limit(100); // Limit to last 100 trades

    console.log(`✅ Found ${trades.length} trades for user ${userId}`);

    // Enrich trade data with market information
    const METADATA_API_BASE_URL = 'https://c.prediction-markets-api.dflow.net';
    const DFLOW_API_KEY = process.env.DFLOW_API_KEY;

    // Get all unique outcome mints from trades
    const outcomeMints = new Set<string>();
    trades.forEach(trade => {
      if (trade.inputMint && trade.inputMint !== USDC_MINT) outcomeMints.add(trade.inputMint);
      if (trade.outputMint && trade.outputMint !== USDC_MINT) outcomeMints.add(trade.outputMint);
    });

    const mintArray = Array.from(outcomeMints);
    console.log(`📊 Fetching market data for ${mintArray.length} unique mints`);

    // Fetch market details in batch
    let marketsData: any[] = [];
    if (mintArray.length > 0) {
      try {
        const marketsResponse = await fetch(
          `${METADATA_API_BASE_URL}/api/v1/markets/batch`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(DFLOW_API_KEY && { 'x-api-key': DFLOW_API_KEY }),
            },
            body: JSON.stringify({ mints: mintArray }),
          }
        );

        if (marketsResponse.ok) {
          const data = await marketsResponse.json() as { markets?: any[] };
          marketsData = data.markets || [];
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      }
    }

    // Create lookup map by mint
    const marketsByMint = new Map<string, any>();
    marketsData.forEach((market: any) => {
      if (market.accounts && typeof market.accounts === 'object') {
        Object.values(market.accounts).forEach((account: any) => {
          if (account.yesMint) marketsByMint.set(account.yesMint, { ...market, isYes: true });
          if (account.noMint) marketsByMint.set(account.noMint, { ...market, isYes: false });
        });
      }
    });

    // Format trades for frontend
    const formattedTrades = trades.map(trade => {
      const isBuy = trade.inputMint === USDC_MINT;
      const outcomeMint = isBuy ? trade.outputMint : trade.inputMint;
      const marketInfo = outcomeMint ? marketsByMint.get(outcomeMint) : undefined;

      // Determine outcome (yes/no) - prefer saved field, fallback to mint lookup
      let outcome: 'yes' | 'no' = 'yes';
      if (trade.outcome && (trade.outcome === 'yes' || trade.outcome === 'no')) {
        outcome = trade.outcome as 'yes' | 'no';
      } else if (marketInfo) {
        outcome = marketInfo.isYes ? 'yes' : 'no';
      }

      // Calculate amounts in decimal form
      const shares = ((isBuy ? trade.outputAmount : trade.inputAmount) || 0) / 1_000_000;
      const usdcAmount = ((isBuy ? trade.inputAmount : trade.outputAmount) || 0) / 1_000_000;

      // Add platform fee to amount for buy trades
      const totalAmount = (trade.side === 'buy' || isBuy)
        ? usdcAmount + (trade.platformFeeUSDC || 0)
        : usdcAmount;

      // Price per share (in dollars)
      const price = shares > 0 ? usdcAmount / shares : 0;

      return {
        _id: trade._id,
        userId: trade.userId,
        ticker: trade.ticker || marketInfo?.ticker || (outcomeMint ? outcomeMint.slice(0, 8) : 'Unknown'),
        marketTitle: trade.marketTitle || marketInfo?.title || marketInfo?.yesSubTitle || 'Unknown Market',
        eventTitle: trade.eventTitle,
        eventTicker: trade.eventTicker || marketInfo?.eventTicker,
        side: trade.side || (isBuy ? 'buy' : 'sell'),
        outcome,
        amount: totalAmount,
        fee: trade.platformFeeUSDC || 0,
        shares,
        price,
        signature: trade.solanaSignature,
        timestamp: new Date(trade.requestReceivedAt || Date.now()).toISOString(),
        createdAt: new Date(trade.requestReceivedAt || Date.now()).toISOString(),
      };
    });

    res.json({
      success: true,
      trades: formattedTrades,
      count: formattedTrades.length,
    });

  } catch (error) {
    console.error('❌ Get user trades error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user trades',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ===========================
// CATEGORY ROUTES
// ===========================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get single category by slug
router.get('/categories/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    res.json({ success: true, category });
  } catch (error) {
    console.error('Failed to fetch category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create new category (admin only)
router.post('/admin/categories', authenticateAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required',
      });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists',
      });
    }

    const category = new Category({
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      tickers: [],
    });

    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    console.error('Failed to create category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update category (admin only)
router.put('/admin/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, tickers } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    // Update fields
    if (name && name.trim()) {
      category.name = name.trim();
      // Regenerate slug if name changed
      category.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    if (description !== undefined) {
      category.description = description?.trim() || '';
    }

    if (Array.isArray(tickers)) {
      // Validate all tickers exist as saved events
      const invalidTickers: string[] = [];

      for (const ticker of tickers) {
        const tickerUpper = ticker.trim().toUpperCase();
        const savedEvent = await Event.findOne({ ticker: tickerUpper });

        if (!savedEvent) {
          invalidTickers.push(tickerUpper);
        }
      }

      if (invalidTickers.length > 0) {
        return res.status(400).json({
          success: false,
          error: `The following tickers were not found in saved events: ${invalidTickers.join(', ')}. Please add these events first.`,
        });
      }

      category.tickers = tickers.map(t => t.trim().toUpperCase());
    }

    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    console.error('Failed to update category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete category (admin only)
router.delete('/admin/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Failed to delete category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Add ticker to category (admin only)
router.post('/admin/categories/:id/tickers', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { ticker } = req.body;

    if (!ticker || !ticker.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Ticker is required',
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    // Validate that the ticker exists as a saved event
    const tickerUpper = ticker.trim().toUpperCase();
    const savedEvent = await Event.findOne({ ticker: tickerUpper });

    if (!savedEvent) {
      return res.status(404).json({
        success: false,
        error: `Ticker "${tickerUpper}" not found in saved events. Please add the event first.`,
      });
    }

    // Add ticker if not already present
    if (!category.tickers.includes(tickerUpper)) {
      category.tickers.push(tickerUpper);
      await category.save();
    }

    res.json({ success: true, category });
  } catch (error) {
    console.error('Failed to add ticker to category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add ticker to category',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Remove ticker from category (admin only)
router.delete('/admin/categories/:id/tickers/:ticker', authenticateAdmin, async (req, res) => {
  try {
    const { id, ticker } = req.params as { id: string; ticker: string };

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    // Remove ticker
    category.tickers = category.tickers.filter(t => t !== ticker.toUpperCase());
    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    console.error('Failed to remove ticker from category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove ticker from category',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Featured events
router.get('/featured', async (req, res) => {
  try {
    const featured = await Featured.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      tickers: featured.map(f => f.ticker),
    });
  } catch (error) {
    console.error('Failed to fetch featured events:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch featured events' });
  }
});

router.post('/featured', authenticateAdmin, async (req, res) => {
  try {
    const { ticker } = req.body;
    if (!ticker) {
      return res.status(400).json({ success: false, error: 'Ticker is required' });
    }

    const existing = await Featured.findOne({ ticker: ticker.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Ticker is already featured' });
    }

    await Featured.create({ ticker: ticker.toUpperCase() });
    res.json({ success: true, message: 'Event featured successfully' });
  } catch (error) {
    console.error('Failed to feature event:', error);
    res.status(500).json({ success: false, error: 'Failed to feature event' });
  }
});

router.delete('/featured/:ticker', authenticateAdmin, async (req, res) => {
  try {
    const { ticker } = req.params as { ticker: string };
    const result = await Featured.findOneAndDelete({ ticker: ticker.toUpperCase() });
    if (!result) {
      return res.status(404).json({ success: false, error: 'Featured event not found' });
    }

    // Clear all candlestick cache for this ticker
    const deletedCount = await candlestickCache.invalidateTickerCache(ticker.toUpperCase());
    console.log(`🗑️  Cleared ${deletedCount} candlestick cache entries for unfeatured ticker: ${ticker.toUpperCase()}`);

    res.json({ success: true, message: 'Event unfeatured successfully' });
  } catch (error) {
    console.error('Failed to unfeature event:', error);
    res.status(500).json({ success: false, error: 'Failed to unfeature event' });
  }
});

// Close empty/worthless token accounts and reclaim rent to admin wallet
router.post('/close-token-accounts', authenticateToken, async (req, res) => {
  try {
    console.log('🧹 Close token accounts endpoint called');
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get user's wallet
    const user = await User.findById(userId);
    if (!user || !user.publicKey || !user.encryptedPrivateKey || !user.iv || !user.authTag) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    // Decrypt user's private key
    const privateKeyBytes = decryptPrivateKey(user.encryptedPrivateKey, user.iv, user.authTag);
    const userKeypair = Keypair.fromSecretKey(privateKeyBytes);

    // Load sponsor wallet as rent recipient (admin wallet)
    const sponsorWallet = loadSponsorWallet();
    if (!sponsorWallet) {
      return res.status(500).json({
        success: false,
        error: 'Admin wallet not configured'
      });
    }

    const rentRecipient = sponsorWallet.publicKey;

    console.log('💰 Rent will be reclaimed to admin wallet:', rentRecipient.toString());

    // Get all user's token accounts
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(user.publicKey),
      { programId: TOKEN_2022_PROGRAM_ID }
    );

    console.log(`📊 Found ${tokenAccounts.value.length} token accounts`);

    const accountsToClose: Array<{
      address: PublicKey;
      mint: PublicKey;
      balance: bigint;
      shouldBurn: boolean;
    }> = [];

    // Analyze each account
    for (const { pubkey, account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info;
      const balance = BigInt(parsedInfo.tokenAmount.amount);
      const mint = new PublicKey(parsedInfo.mint);

      // Empty accounts - just close
      if (balance === 0n) {
        accountsToClose.push({
          address: pubkey,
          mint,
          balance,
          shouldBurn: false,
        });
        continue;
      }

      // Check if this is a worthless position (lost in finalized market)
      // For now, we'll skip this check and let users manually close worthless positions
      // In the future, you could query the market status and determine if it's worthless
    }

    console.log(`🗑️ Found ${accountsToClose.length} accounts to close`);

    if (accountsToClose.length === 0) {
      return res.json({
        success: true,
        message: 'No accounts to close',
        closedCount: 0,
        reclaimedLamports: 0,
      });
    }

    // Build transaction with close instructions
    const { getAccount, createBurnInstruction, createCloseAccountInstruction } = await import('@solana/spl-token');
    const transaction = new Transaction();

    for (const acc of accountsToClose) {
      // Burn tokens if balance > 0
      if (acc.shouldBurn && acc.balance > 0n) {
        const burnIx = createBurnInstruction(
          acc.address,
          acc.mint,
          userKeypair.publicKey,
          acc.balance,
          [],
          TOKEN_2022_PROGRAM_ID
        );
        transaction.add(burnIx);
      }

      // Close account
      const closeIx = createCloseAccountInstruction(
        acc.address,
        rentRecipient, // Admin wallet receives rent
        userKeypair.publicKey,
        [],
        TOKEN_2022_PROGRAM_ID
      );
      transaction.add(closeIx);
    }

    // Send transaction
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sponsorWallet.publicKey; // Sponsor pays gas

    // Sign with both user (to close accounts) and sponsor (to pay fees)
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [userKeypair, sponsorWallet]
    );

    // Get transaction details to see rent reclaimed
    const txInfo = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    const fee = txInfo?.meta?.fee || 0;

    // Calculate total rent reclaimed (approximate: 0.00203928 SOL per account)
    const RENT_PER_ACCOUNT = 2039280; // lamports
    const totalRentReclaimed = accountsToClose.length * RENT_PER_ACCOUNT;

    console.log('✅ Closed accounts:', {
      count: accountsToClose.length,
      signature,
      reclaimedLamports: totalRentReclaimed,
      reclaimedSOL: totalRentReclaimed / 1e9,
    });

    res.json({
      success: true,
      message: `Closed ${accountsToClose.length} token accounts`,
      closedCount: accountsToClose.length,
      signature,
      reclaimedLamports: totalRentReclaimed,
      reclaimedSOL: totalRentReclaimed / 1e9,
      adminWallet: rentRecipient.toString(),
    });

  } catch (error) {
    console.error('❌ Close token accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to close token accounts',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Close worthless positions (burn + close)
router.post('/close-worthless-positions', authenticateToken, async (req, res) => {
  try {
    console.log('🔥 Close worthless positions endpoint called');
    const userId = (req as any).user?.id;
    const { mints } = req.body; // Array of mint addresses to burn and close

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!mints || !Array.isArray(mints) || mints.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing or invalid mints array' });
    }

    // Get user's wallet
    const user = await User.findById(userId);
    if (!user || !user.publicKey || !user.encryptedPrivateKey || !user.iv || !user.authTag) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    // Decrypt user's private key
    const privateKeyBytes = decryptPrivateKey(user.encryptedPrivateKey, user.iv, user.authTag);
    const userKeypair = Keypair.fromSecretKey(privateKeyBytes);

    // Load sponsor wallet
    const sponsorWallet = loadSponsorWallet();
    if (!sponsorWallet) {
      return res.status(500).json({ success: false, error: 'Admin wallet not configured' });
    }

    const rentRecipient = sponsorWallet.publicKey;

    // Get token accounts and burn/close
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    const { getAccount, getAssociatedTokenAddress, createBurnInstruction, createCloseAccountInstruction } = await import('@solana/spl-token');
    const transaction = new Transaction();
    let closedCount = 0;

    for (const mintStr of mints) {
      try {
        const mint = new PublicKey(mintStr);
        const tokenAccount = await getAssociatedTokenAddress(
          mint,
          userKeypair.publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );

        const account = await getAccount(connection, tokenAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);

        // Burn if balance > 0
        if (account.amount > 0n) {
          const burnIx = createBurnInstruction(
            tokenAccount,
            mint,
            userKeypair.publicKey,
            account.amount,
            [],
            TOKEN_2022_PROGRAM_ID
          );
          transaction.add(burnIx);
        }

        // Close account
        const closeIx = createCloseAccountInstruction(
          tokenAccount,
          rentRecipient,
          userKeypair.publicKey,
          [],
          TOKEN_2022_PROGRAM_ID
        );
        transaction.add(closeIx);
        closedCount++;

      } catch (err) {
        console.warn(`⚠️ Failed to process mint ${mintStr}:`, err);
        // Continue with other mints
      }
    }

    if (closedCount === 0) {
      return res.json({
        success: true,
        message: 'No accounts to close',
        closedCount: 0,
      });
    }

    // Send transaction
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sponsorWallet.publicKey;

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [userKeypair, sponsorWallet]
    );

    console.log('✅ Burned and closed worthless positions:', {
      count: closedCount,
      signature,
    });

    res.json({
      success: true,
      message: `Burned and closed ${closedCount} worthless positions`,
      closedCount,
      signature,
      adminWallet: rentRecipient.toString(),
    });

  } catch (error) {
    console.error('❌ Close worthless positions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to close worthless positions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Fetch news for given event titles (comma-separated, max 10)
router.get('/news', async (req, res) => {
  try {
    const titlesParam = req.query.titles as string;
    if (!titlesParam) {
      return res.status(400).json({ success: false, error: 'Missing titles parameter' });
    }

    const titles = titlesParam.split(',').map(t => t.trim()).filter(Boolean).slice(0, 10);
    if (titles.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid titles provided' });
    }

    const results = await Promise.all(
      titles.map(async (title) => {
        try {
          // Use cache with 1-day TTL
          const response = await newsCache.fetch(
            title,
            async () => {
              return await NewsService.searchNews(title, {
                pageSize: 3,
                sortBy: 'relevancy',
              });
            }
          );
          return {
            eventTitle: title,
            articles: response.articles.slice(0, 3),
          };
        } catch {
          return { eventTitle: title, articles: [] };
        }
      })
    );

    res.json({ success: true, results });
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// GEOBLOCKING ROUTES
// ============================================================================

// Check user's location and geoblocking status (public endpoint)
router.get('/geoblock/check', async (req, res) => {
  try {
    // Get user's IP address
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
               req.headers['x-real-ip']?.toString() ||
               req.socket.remoteAddress ||
               'unknown';

    console.log('🌍 Checking geoblocking for IP:', ip);

    // Skip geolocation for local IPs
    if (ip === 'unknown' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return res.json({
        success: true,
        blocked: false,
        countryCode: null,
        countryName: 'Local',
        message: 'Local IP - not geoblocked'
      });
    }

    // Get geolocation using ip-api.com (free, no API key needed)
    const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);

    if (!geoResponse.ok) {
      console.error('Geolocation API error:', geoResponse.status);
      // If geolocation fails, allow access (fail open)
      return res.json({
        success: true,
        blocked: false,
        countryCode: null,
        countryName: 'Unknown',
        message: 'Geolocation unavailable - allowing access'
      });
    }

    const geoData = await geoResponse.json() as {
      status: string;
      country: string;
      countryCode: string;
    };

    if (geoData.status !== 'success') {
      console.error('Geolocation failed:', geoData);
      return res.json({
        success: true,
        blocked: false,
        countryCode: null,
        countryName: 'Unknown',
        message: 'Geolocation failed - allowing access'
      });
    }

    console.log('📍 User location:', geoData.country, geoData.countryCode);

    // Check if country is geoblocked
    const geoblock = await GeoBlock.findOne({ countryCode: geoData.countryCode });

    if (geoblock) {
      console.log('🚫 Country is geoblocked:', geoData.country);
      return res.json({
        success: true,
        blocked: true,
        countryCode: geoData.countryCode,
        countryName: geoData.country,
        message: 'Trading is not available in your location'
      });
    }

    res.json({
      success: true,
      blocked: false,
      countryCode: geoData.countryCode,
      countryName: geoData.country,
      message: 'Trading is available in your location'
    });
  } catch (error) {
    console.error('Geoblock check error:', error);
    // If error, fail open (allow access)
    res.json({
      success: true,
      blocked: false,
      countryCode: null,
      countryName: 'Unknown',
      message: 'Geoblocking check failed - allowing access'
    });
  }
});

// Get all geoblocked countries (admin only)
router.get('/admin/geoblocks', authenticateAdmin, async (req, res) => {
  try {
    const geoblocks = await GeoBlock.find().sort({ countryName: 1 });
    res.json({
      success: true,
      geoblocks,
      count: geoblocks.length
    });
  } catch (error) {
    console.error('Get geoblocks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch geoblocked countries',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Add a country to geoblock list (admin only)
router.post('/admin/geoblocks', authenticateAdmin, async (req, res) => {
  try {
    const { countryCode, countryName } = req.body;

    if (!countryCode || !countryName) {
      return res.status(400).json({
        success: false,
        error: 'Country code and name are required'
      });
    }

    // Check if already geoblocked
    const existing = await GeoBlock.findOne({ countryCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Country is already geoblocked'
      });
    }

    const geoblock = await GeoBlock.create({
      countryCode: countryCode.toUpperCase(),
      countryName
    });

    console.log('✅ Added geoblock:', countryName, countryCode);

    res.json({
      success: true,
      geoblock,
      message: `Successfully blocked ${countryName}`
    });
  } catch (error) {
    console.error('Add geoblock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add geoblocked country',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Remove a country from geoblock list (admin only)
router.delete('/admin/geoblocks/:countryCode', authenticateAdmin, async (req, res) => {
  try {
    const { countryCode } = req.params;

    if (!countryCode || typeof countryCode !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid country code'
      });
    }

    const geoblock = await GeoBlock.findOneAndDelete({
      countryCode: countryCode.toUpperCase()
    });

    if (!geoblock) {
      return res.status(404).json({
        success: false,
        error: 'Country not found in geoblock list'
      });
    }

    console.log('✅ Removed geoblock:', geoblock.countryName, countryCode);

    res.json({
      success: true,
      message: `Successfully unblocked ${geoblock.countryName}`,
      geoblock
    });
  } catch (error) {
    console.error('Remove geoblock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove geoblocked country',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Admin: Get user positions
router.get('/admin/users/:userId/positions', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user
    const user = await User.findById(userId);
    if (!user || !user.publicKey) {
      return res.status(404).json({ success: false, error: 'User or wallet not found' });
    }

    // Fetch positions using same logic as /positions endpoint
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(user.publicKey),
      { programId: TOKEN_2022_PROGRAM_ID }
    );

    const nonZeroBalances = tokenAccounts.value
      .map((account) => {
        const parsedInfo = account.account.data.parsed.info;
        return {
          mint: parsedInfo.mint,
          balance: parsedInfo.tokenAmount.uiAmount,
          decimals: parsedInfo.tokenAmount.decimals,
        };
      })
      .filter((token) => token.balance > 0);

    if (nonZeroBalances.length === 0) {
      return res.json({
        success: true,
        positions: [],
        count: 0,
        message: 'No token positions found',
      });
    }

    // Filter for prediction market mints
    const METADATA_API_BASE_URL = 'https://c.prediction-markets-api.dflow.net';
    const DFLOW_API_KEY = process.env.DFLOW_API_KEY;
    const allMintAddresses = nonZeroBalances.map((token) => token.mint);

    const filterResponse = await fetch(
      `${METADATA_API_BASE_URL}/api/v1/filter_outcome_mints`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(DFLOW_API_KEY && { 'x-api-key': DFLOW_API_KEY }),
        },
        body: JSON.stringify({ addresses: allMintAddresses }),
      }
    );

    const filterData = await filterResponse.json() as { outcomeMints?: string[] };
    const predictionMintAddresses = filterData.outcomeMints || [];

    const outcomeTokens = nonZeroBalances.filter((token) =>
      predictionMintAddresses.includes(token.mint)
    );

    // Fetch market details
    const marketsResponse = await fetch(
      `${METADATA_API_BASE_URL}/api/v1/markets/batch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(DFLOW_API_KEY && { 'x-api-key': DFLOW_API_KEY }),
        },
        body: JSON.stringify({ mints: predictionMintAddresses }),
      }
    );

    const marketsData = await marketsResponse.json() as { markets?: any[] };
    const markets = marketsData.markets || [];

    const marketsByMint = new Map<string, any>();
    markets.forEach((market: any) => {
      if (market.accounts && typeof market.accounts === 'object') {
        Object.values(market.accounts).forEach((account: any) => {
          if (account.yesMint) marketsByMint.set(account.yesMint, market);
          if (account.noMint) marketsByMint.set(account.noMint, market);
        });
      }
    });

    const userPositions = outcomeTokens.map((token) => {
      const marketData = marketsByMint.get(token.mint);

      if (!marketData) {
        return {
          mint: token.mint,
          balance: token.balance,
          decimals: token.decimals,
          position: 'UNKNOWN',
          market: null,
          isRedeemable: false,
        };
      }

      const isYesToken = Object.values(marketData.accounts || {}).some(
        (account: any) => account.yesMint === token.mint
      );

      const isNoToken = Object.values(marketData.accounts || {}).some(
        (account: any) => account.noMint === token.mint
      );

      let isRedeemable = false;
      if (marketData.status === "finalized") {
        const result = marketData.result;

        if (marketData.accounts && marketData.accounts[USDC_MINT]) {
          const usdcAccount = marketData.accounts[USDC_MINT];

          if (usdcAccount.redemptionStatus === "open") {
            if (result === "yes" || result === "no") {
              if (
                (result === "yes" && usdcAccount.yesMint === token.mint) ||
                (result === "no" && usdcAccount.noMint === token.mint)
              ) {
                isRedeemable = true;
              }
            } else if (
              result === "" &&
              usdcAccount.scalarOutcomePct !== null &&
              usdcAccount.scalarOutcomePct !== undefined
            ) {
              if (
                usdcAccount.yesMint === token.mint ||
                usdcAccount.noMint === token.mint
              ) {
                isRedeemable = true;
              }
            }
          }
        }
      }

      return {
        mint: token.mint,
        balance: token.balance,
        decimals: token.decimals,
        position: isYesToken ? 'YES' : isNoToken ? 'NO' : 'UNKNOWN',
        isRedeemable,
        market: {
          ticker: marketData.ticker,
          eventTicker: marketData.eventTicker,
          title: marketData.title || marketData.yesSubTitle,
          status: marketData.status,
          result: marketData.result,
        },
      };
    });

    res.json({
      success: true,
      positions: userPositions,
      count: userPositions.length,
    });

  } catch (error) {
    console.error('❌ Get user positions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user positions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Admin: Close user's ONLY empty and worthless (losing) token accounts
router.post('/admin/users/:userId/close-accounts', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user
    const user = await User.findById(userId);
    if (!user || !user.publicKey || !user.encryptedPrivateKey || !user.iv || !user.authTag) {
      return res.status(404).json({ success: false, error: 'User or wallet not found' });
    }

    // Decrypt user's private key
    const privateKeyBytes = decryptPrivateKey(user.encryptedPrivateKey, user.iv, user.authTag);
    const userKeypair = Keypair.fromSecretKey(privateKeyBytes);

    // Load sponsor wallet
    const sponsorWallet = loadSponsorWallet();
    if (!sponsorWallet) {
      return res.status(500).json({ success: false, error: 'Admin wallet not configured' });
    }

    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

    // Get all token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(user.publicKey),
      { programId: TOKEN_2022_PROGRAM_ID }
    );

    const nonZeroBalances = tokenAccounts.value
      .map((account) => {
        const parsedInfo = account.account.data.parsed.info;
        return {
          mint: parsedInfo.mint,
          balance: parsedInfo.tokenAmount.uiAmount,
          decimals: parsedInfo.tokenAmount.decimals,
        };
      });

    // Filter for prediction market mints
    const METADATA_API_BASE_URL = 'https://c.prediction-markets-api.dflow.net';
    const DFLOW_API_KEY = process.env.DFLOW_API_KEY;
    const allMintAddresses = nonZeroBalances.map((token) => token.mint);

    if (allMintAddresses.length === 0) {
      return res.json({
        success: true,
        message: 'No token accounts found',
        closedCount: 0,
      });
    }

    const filterResponse = await fetch(
      `${METADATA_API_BASE_URL}/api/v1/filter_outcome_mints`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(DFLOW_API_KEY && { 'x-api-key': DFLOW_API_KEY }),
        },
        body: JSON.stringify({ addresses: allMintAddresses }),
      }
    );

    const filterData = await filterResponse.json() as { outcomeMints?: string[] };
    const predictionMintAddresses = filterData.outcomeMints || [];

    // Fetch market details for prediction mints
    if (predictionMintAddresses.length > 0) {
      const marketsResponse = await fetch(
        `${METADATA_API_BASE_URL}/api/v1/markets/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(DFLOW_API_KEY && { 'x-api-key': DFLOW_API_KEY }),
          },
          body: JSON.stringify({ mints: predictionMintAddresses }),
        }
      );

      const marketsData = await marketsResponse.json() as { markets?: any[] };
      const markets = marketsData.markets || [];

      const marketsByMint = new Map<string, any>();
      markets.forEach((market: any) => {
        if (market.accounts && typeof market.accounts === 'object') {
          Object.values(market.accounts).forEach((account: any) => {
            if (account.yesMint) marketsByMint.set(account.yesMint, market);
            if (account.noMint) marketsByMint.set(account.noMint, market);
          });
        }
      });

      // Determine which mints are safe to close
      const mintsToClose: string[] = [];

      for (const token of nonZeroBalances) {
        const marketData = marketsByMint.get(token.mint);

        // If balance is 0, safe to close
        if (token.balance === 0) {
          mintsToClose.push(token.mint);
          continue;
        }

        // If no market data or market is active, DO NOT close
        if (!marketData || marketData.status === 'active' || marketData.status === 'closed') {
          console.log(`⚠️ Skipping ${token.mint}: Active or open market`);
          continue;
        }

        // Only close if market is finalized AND position is NOT redeemable
        if (marketData.status === 'finalized') {
          let isRedeemable = false;
          const result = marketData.result;

          if (marketData.accounts && marketData.accounts[USDC_MINT]) {
            const usdcAccount = marketData.accounts[USDC_MINT];

            if (usdcAccount.redemptionStatus === 'open') {
              // Check if this is a winning position
              if (result === 'yes' && usdcAccount.yesMint === token.mint) {
                isRedeemable = true;
              } else if (result === 'no' && usdcAccount.noMint === token.mint) {
                isRedeemable = true;
              } else if (result === '' && usdcAccount.scalarOutcomePct !== null) {
                isRedeemable = true;
              }
            }
          }

          // Only close LOSING positions (not redeemable)
          if (!isRedeemable) {
            mintsToClose.push(token.mint);
          } else {
            console.log(`⚠️ Skipping ${token.mint}: Winning/redeemable position`);
          }
        }
      }

      if (mintsToClose.length === 0) {
        return res.json({
          success: true,
          message: 'No closable accounts found (only active or winning positions)',
          closedCount: 0,
        });
      }

      // Now close only the safe accounts
      const { getAccount, getAssociatedTokenAddress, createBurnInstruction, createCloseAccountInstruction } = await import('@solana/spl-token');
      const transaction = new Transaction();
      let closedCount = 0;

      for (const mintStr of mintsToClose) {
        try {
          const mint = new PublicKey(mintStr);
          const tokenAccount = await getAssociatedTokenAddress(
            mint,
            userKeypair.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID
          );

          const account = await getAccount(connection, tokenAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);

          // Burn if balance > 0
          if (account.amount > 0n) {
            const burnIx = createBurnInstruction(
              tokenAccount,
              mint,
              userKeypair.publicKey,
              account.amount,
              [],
              TOKEN_2022_PROGRAM_ID
            );
            transaction.add(burnIx);
          }

          // Close account (rent to sponsor)
          const closeIx = createCloseAccountInstruction(
            tokenAccount,
            sponsorWallet.publicKey,
            userKeypair.publicKey,
            [],
            TOKEN_2022_PROGRAM_ID
          );
          transaction.add(closeIx);
          closedCount++;

        } catch (err) {
          console.warn(`⚠️ Failed to process mint ${mintStr}:`, err);
          continue;
        }
      }

      if (closedCount === 0) {
        return res.json({
          success: true,
          message: 'No accounts to close',
          closedCount: 0,
        });
      }

      // Send transaction
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sponsorWallet.publicKey;

      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [userKeypair, sponsorWallet]
      );

      // Calculate rent reclaimed
      const RENT_PER_ACCOUNT = 2039280; // lamports
      const totalRentReclaimed = closedCount * RENT_PER_ACCOUNT;

      console.log('✅ Closed user accounts (worthless only):', {
        userId,
        userEmail: user.email,
        count: closedCount,
        signature,
        reclaimedSOL: totalRentReclaimed / 1e9,
      });

      res.json({
        success: true,
        message: `Closed ${closedCount} worthless/empty token accounts for user ${user.email}`,
        closedCount,
        signature,
        reclaimedLamports: totalRentReclaimed,
        reclaimedSOL: totalRentReclaimed / 1e9,
        adminWallet: sponsorWallet.publicKey.toString(),
      });
    } else {
      return res.json({
        success: true,
        message: 'No prediction market accounts found',
        closedCount: 0,
      });
    }

  } catch (error) {
    console.error('❌ Close user accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to close user accounts',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
