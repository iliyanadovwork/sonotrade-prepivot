import dotenv from 'dotenv';

dotenv.config();

const DFLOW_API_KEY = process.env.DFLOW_API_KEY;
// Ensure the base URL does NOT include the /api/v1 path so we don't double-prefix it when
// endpoints already include /api/v1. Users should set DFLOW_API_URL to the host (e.g. https://prediction-markets-api.dflow.net)
const DFLOW_API_URL = process.env.DFLOW_API_URL || 'https://prediction-markets-api.dflow.net';

export class DflowService {
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor() {
    this.apiKey = DFLOW_API_KEY;
    this.baseUrl = DFLOW_API_URL;
  }

  private checkApiKey() {
    if (!this.apiKey) {
      throw new Error('DFLOW_API_KEY is not set in environment variables');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    this.checkApiKey();
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'x-api-key': this.apiKey!,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dflow API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Dflow API Error')) {
        throw error;
      }
      throw new Error(`Network error calling Dflow API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getEvents(params?: {
    limit?: number;
    cursor?: number;
    withNestedMarkets?: boolean;
    seriesTickers?: string;
    tickers?: string;
    isInitialized?: boolean;
    status?: 'initialized' | 'active' | 'inactive' | 'closed' | 'determined';
    sort?: 'volume' | 'volume24h' | 'liquidity' | 'openInterest' | 'startDate';
  }) {
    const queryParams = new URLSearchParams();

    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.cursor !== undefined) queryParams.append('cursor', params.cursor.toString());
    if (params?.withNestedMarkets !== undefined) queryParams.append('withNestedMarkets', params.withNestedMarkets.toString());
    if (params?.seriesTickers) queryParams.append('seriesTickers', params.seriesTickers);
    if (params?.tickers) queryParams.append('tickers', params.tickers);
    if (params?.isInitialized !== undefined) queryParams.append('isInitialized', params.isInitialized.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/events${queryString ? `?${queryString}` : ''}`;

    return this.request<{ events: any[]; cursor: number | null }>(endpoint);
  }

  async getEventById(eventId: string, withNestedMarkets?: boolean, withMarketAccounts?: boolean) {
    const queryParams = new URLSearchParams();
    if (withNestedMarkets !== undefined) queryParams.append('withNestedMarkets', withNestedMarkets.toString());
    if (withMarketAccounts !== undefined) queryParams.append('withMarketAccounts', withMarketAccounts.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/event/${eventId}${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async searchEvents(params: {
    q: string;
    sort?: 'volume' | 'volume24h' | 'liquidity' | 'openInterest' | 'startDate';
    order?: 'asc' | 'desc';
    limit?: number;
    cursor?: number;
    withNestedMarkets?: boolean;
    withMarketAccounts?: boolean;
  }) {
    const queryParams = new URLSearchParams();

    queryParams.append('q', params.q);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.cursor !== undefined) queryParams.append('cursor', params.cursor.toString());
    if (params.withNestedMarkets !== undefined) queryParams.append('withNestedMarkets', params.withNestedMarkets.toString());
    if (params.withMarketAccounts !== undefined) queryParams.append('withMarketAccounts', params.withMarketAccounts.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/search${queryString ? `?${queryString}` : ''}`;

    return this.request<{ events: any[]; cursor: number | null }>(endpoint);
  }

  async getEventCandlesticks(ticker: string, params: {
    startTs: number;
    endTs: number;
    periodInterval: number;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('startTs', params.startTs.toString());
    queryParams.append('endTs', params.endTs.toString());
    queryParams.append('periodInterval', params.periodInterval.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/event/${ticker}/candlesticks${queryString ? `?${queryString}` : ''}`;

    console.log('Fetching event candlesticks:', {
      ticker,
      endpoint,
      fullUrl: `${this.baseUrl}${endpoint}`,
      params
    });

    return this.request(endpoint);
  }

  async getMarketCandlesticks(ticker: string, params: {
    startTs: number;
    endTs: number;
    periodInterval: number;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('startTs', params.startTs.toString());
    queryParams.append('endTs', params.endTs.toString());
    queryParams.append('periodInterval', params.periodInterval.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/market/${ticker}/candlesticks${queryString ? `?${queryString}` : ''}`;

    console.log('Fetching market candlesticks:', {
      ticker,
      endpoint,
      fullUrl: `${this.baseUrl}${endpoint}`,
      params
    });

    return this.request(endpoint);
  }

  async getOrderbook(mintAddress: string) {
    const encodedMint = encodeURIComponent(mintAddress);
    const endpoint = `/api/v1/orderbook/by-mint/${encodedMint}`;

    console.log('Fetching orderbook:', {
      mintAddress,
      endpoint,
      fullUrl: `${this.baseUrl}${endpoint}`
    });

    return this.request(endpoint);
  }

  async getTrades(params: {
    ticker: string;
    limit?: number;
    cursor?: string;
    minTs?: number;
    maxTs?: number;
  }) {
    const queryParams = new URLSearchParams();
    
    queryParams.append('ticker', params.ticker);
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.cursor) queryParams.append('cursor', params.cursor);
    if (params.minTs !== undefined) queryParams.append('minTs', params.minTs.toString());
    if (params.maxTs !== undefined) queryParams.append('maxTs', params.maxTs.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/trades${queryString ? `?${queryString}` : ''}`;

    console.log('Fetching trades:', {
      ticker: params.ticker,
      endpoint,
      fullUrl: `${this.baseUrl}${endpoint}`
    });

    return this.request<{ trades: any[]; cursor: string | null }>(endpoint);
  }
}

export const dflowService = new DflowService();

