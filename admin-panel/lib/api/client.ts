const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sonotrade-v2-production.up.railway.app/api';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Attach auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || response.statusText;
        throw new Error(`API Error: ${response.status} ${errorMessage}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Backend server is not running. Make sure the backend is started with `npm run dev` in the backend folder.');
      }
      throw error;
    }
  }

  async adminLogin(email: string, password: string) {
    return this.request<{
      success: boolean;
      accessToken: string;
      user: { _id: string; email: string; isAdmin: boolean };
    }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<{
      success: boolean;
      user: { _id: string; email: string; isAdmin: boolean };
    }>('/auth/me');
  }

  async health() {
    return this.request<{ status: string; message: string }>('/health');
  }

  async test() {
    return this.request<{ message: string; timestamp: string }>('/test');
  }

  async getUsers() {
    return this.request<{
      success: boolean;
      count: number;
      users: Array<{ _id: string; username?: string; email: string; createdAt: string; updatedAt: string }>
    }>('/users');
  }

  async getDflowEvents(params?: {
    limit?: number;
    cursor?: number;
    withNestedMarkets?: boolean;
    seriesTickers?: string;
    tickers?: string;
    isInitialized?: boolean;
    status?: string;
    sort?: string;
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
    return this.request<{
      success: boolean;
      events: any[];
      cursor: number | null;
    }>(`/dflow/events${queryString ? `?${queryString}` : ''}`);
  }

  async searchDflowEvents(params: {
    q: string;
    sort?: string;
    order?: string;
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
    return this.request<{
      success: boolean;
      events: any[];
      cursor: number | null;
    }>(`/dflow/search${queryString ? `?${queryString}` : ''}`);
  }

  async getDflowEvent(eventId: string, withNestedMarkets?: boolean) {
    const queryParams = new URLSearchParams();
    if (withNestedMarkets !== undefined) queryParams.append('withNestedMarkets', withNestedMarkets.toString());

    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      data: any;
    }>(`/dflow/event/${eventId}${queryString ? `?${queryString}` : ''}`);
  }

  async saveEvent(ticker: string, imageUrl?: string) {
    const body: any = { ticker };
    if (imageUrl !== undefined) body.imageUrl = imageUrl;

    return this.request<{
      success: boolean;
      message: string;
      event: any;
    }>('/events', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getSavedEvents(options?: { limit?: number; offset?: number; includeInactive?: boolean }) {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.includeInactive) params.append('includeInactive', 'true');

    const url = params.toString() ? `/events?${params.toString()}` : '/events';
    return this.request<{
      success: boolean;
      count: number;
      total?: number;
      events: Array<{ _id: string; ticker: string; title?: string; imageUrl?: string; active?: boolean; createdAt: string; updatedAt: string }>;
    }>(url);
  }

  async checkEventExists(ticker: string) {
    return this.request<{
      success: boolean;
      exists: boolean;
      event: any;
    }>(`/events/check/${ticker}`);
  }

  async updateEvent(ticker: string, imageUrl?: string) {
    const body: any = {};
    if (imageUrl !== undefined) body.imageUrl = imageUrl;

    return this.request<{
      success: boolean;
      message: string;
      event: any;
    }>(`/events/${ticker}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async toggleEventActive(ticker: string) {
    return this.request<{
      success: boolean;
      message: string;
      event: any;
    }>(`/events/${ticker}/active`, {
      method: 'PATCH',
    });
  }

  async deleteEvent(ticker: string) {
    return this.request<{
      success: boolean;
      message: string;
      event: any;
    }>(`/events/${ticker}`, {
      method: 'DELETE',
    });
  }

  // Category methods
  async getCategories() {
    return this.request<{
      success: boolean;
      categories: Array<{
        _id: string;
        name: string;
        slug: string;
        description?: string;
        tickers: string[];
        createdAt: string;
        updatedAt: string;
      }>;
    }>('/categories');
  }

  async getCategory(slug: string) {
    return this.request<{
      success: boolean;
      category: {
        _id: string;
        name: string;
        slug: string;
        description?: string;
        tickers: string[];
        createdAt: string;
        updatedAt: string;
      };
    }>(`/categories/${slug}`);
  }

  async createCategory(name: string, description?: string) {
    return this.request<{
      success: boolean;
      category: any;
    }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async updateCategory(id: string, data: { name?: string; description?: string; tickers?: string[] }) {
    return this.request<{
      success: boolean;
      category: any;
    }>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async addTickerToCategory(categoryId: string, ticker: string) {
    return this.request<{
      success: boolean;
      category: any;
    }>(`/admin/categories/${categoryId}/tickers`, {
      method: 'POST',
      body: JSON.stringify({ ticker }),
    });
  }

  async removeTickerFromCategory(categoryId: string, ticker: string) {
    return this.request<{
      success: boolean;
      category: any;
    }>(`/admin/categories/${categoryId}/tickers/${ticker}`, {
      method: 'DELETE',
    });
  }

  async getFeatured() {
    return this.request<{
      success: boolean;
      tickers: string[];
    }>('/featured');
  }

  async featureTicker(ticker: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>('/featured', {
      method: 'POST',
      body: JSON.stringify({ ticker }),
    });
  }

  async unfeatureTicker(ticker: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/featured/${ticker}`, {
      method: 'DELETE',
    });
  }

  async getTrades(params?: {
    limit?: number;
    offset?: number;
    ticker?: string;
    userId?: string;
    side?: string;
    outcome?: string;
    startDate?: number;
    endDate?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params?.ticker) queryParams.append('ticker', params.ticker);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.side) queryParams.append('side', params.side);
    if (params?.outcome) queryParams.append('outcome', params.outcome);
    if (params?.startDate !== undefined) queryParams.append('startDate', params.startDate.toString());
    if (params?.endDate !== undefined) queryParams.append('endDate', params.endDate.toString());

    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      trades: Array<{
        _id: string;
        internalTradeId: string;
        userId: string;
        user: {
          _id: string;
          username?: string;
          email: string;
          publicKey: string;
        } | null;
        ticker: string;
        marketTitle: string;
        eventTitle: string;
        eventTicker: string;
        side: string;
        outcome: string;
        formattedShares: string;
        formattedAmount: string;
        formattedPrice: string;
        formattedFee: string;
        timestamp: number;
        solanaSignature?: string;
        platformFeeSignature?: string;
        quotePriceImpactPct?: number;
      }>;
      total: number;
      totalVolume: string;
      hasMore: boolean;
    }>(`/admin/trades${queryString ? `?${queryString}` : ''}`);
  }

  async getGeoblocks() {
    return this.request<{
      success: boolean;
      geoblocks: Array<{
        _id: string;
        countryCode: string;
        countryName: string;
        createdAt: string;
      }>;
      count: number;
    }>('/admin/geoblocks');
  }

  async addGeoblock(countryCode: string, countryName: string) {
    return this.request<{
      success: boolean;
      geoblock: any;
      message: string;
    }>('/admin/geoblocks', {
      method: 'POST',
      body: JSON.stringify({ countryCode, countryName }),
    });
  }

  async removeGeoblock(countryCode: string) {
    return this.request<{
      success: boolean;
      message: string;
      geoblock: any;
    }>(`/admin/geoblocks/${countryCode}`, {
      method: 'DELETE',
    });
  }

  async getUserPositions(userId: string) {
    return this.request<{
      success: boolean;
      positions: Array<{
        mint: string;
        balance: number;
        decimals: number;
        position: string;
        isRedeemable: boolean;
        market: any;
      }>;
      count: number;
    }>(`/admin/users/${userId}/positions`);
  }

  async closeUserTokenAccounts(userId: string) {
    return this.request<{
      success: boolean;
      message?: string;
      closedCount: number;
      signature?: string;
      reclaimedLamports?: number;
      reclaimedSOL?: number;
      adminWallet?: string;
      error?: string;
    }>(`/admin/users/${userId}/close-accounts`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();

