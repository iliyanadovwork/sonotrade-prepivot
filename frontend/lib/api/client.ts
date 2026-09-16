const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sonotrade-v2-production.up.railway.app/api';

export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;


    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
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
        throw new Error('Unable to connect to server');
      }
      throw error;
    }
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
      users: Array<{ _id: string; name: string; email: string; createdAt: string; updatedAt: string }>
    }>('/users');
  }

  async getMarketEvents(params?: {
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

  async getSavedEvents(params?: { limit?: number; offset?: number; includeInactive?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params?.includeInactive) queryParams.append('includeInactive', 'true');

    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      count: number;
      total: number;
      events: Array<{ _id: string; ticker: string; imageUrl?: string; gifUrl?: string; active?: boolean; createdAt: string; updatedAt: string }>;
    }>(`/events${queryString ? `?${queryString}` : ''}`);
  }

  async getMarketEvent(eventId: string, withNestedMarkets: boolean = true, withMarketAccounts: boolean = true) {
    const queryParams = new URLSearchParams();
    if (withNestedMarkets) queryParams.append('withNestedMarkets', 'true');
    if (withMarketAccounts) queryParams.append('withMarketAccounts', 'true');

    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      data: any;
    }>(`/dflow/event/${eventId}${queryString ? `?${queryString}` : ''}`);
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
    return this.request<{
      success: boolean;
      data: any;
    }>(`/dflow/events/${ticker}/candlesticks?${queryString}`);
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
    return this.request<{
      success: boolean;
      data: any;
    }>(`/dflow/market/${ticker}/candlesticks?${queryString}`);
  }

  async getOrderbook(mintAddress: string) {
    // Call the backend proxy route to fetch orderbook data
    return this.request<{
      success: boolean;
      data: any;
    }>(`/dflow/orderbook/${encodeURIComponent(mintAddress)}`);
  }

  async getEventMetadata(eventTicker: string) {
    // Fetch event metadata via backend proxy
    return this.request<{
      success: boolean;
      data: {
        image_url?: string;
        featured_image_url?: string;
        market_details?: Array<{
          ticker: string;
          image_url?: string;
        }>;
        settlement_sources?: Array<{
          name: string;
          url: string;
        }>;
        competition?: string | null;
        competition_scope?: string | null;
      };
    }>(`/kalshi/events/${encodeURIComponent(eventTicker)}/metadata`);
  }

  async getEventData(eventTicker: string, withNestedMarkets: boolean = true) {
    // Fetch event data via backend proxy
    const queryParams = new URLSearchParams();
    if (withNestedMarkets) {
      queryParams.append('with_nested_markets', 'true');
    }

    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      event: any;
      markets?: any[];
    }>(`/kalshi/events/${encodeURIComponent(eventTicker)}${queryString ? `?${queryString}` : ''}`);
  }

  async getDflowEvent(eventTicker: string, withNestedMarkets: boolean = true, withMarketAccounts: boolean = true) {
    // Fetch event data from dflow API to get market titles
    const queryParams = new URLSearchParams();
    if (withNestedMarkets) queryParams.append('withNestedMarkets', 'true');
    if (withMarketAccounts) queryParams.append('withMarketAccounts', 'true');

    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      data: {
        ticker: string;
        seriesTicker: string;
        strikeDate: number | null;
        strikePeriod: string | null;
        title: string;
        subtitle: string;
        imageUrl?: string;
        settlementSources?: Array<{
          name: string;
          url: string;
        }>;
        volume: number;
        volume24h: number;
        liquidity: number;
        openInterest: number;
        markets: Array<{
          ticker: string;
          eventTicker: string;
          marketType: string;
          title: string;
          subtitle: string;
          yesSubTitle: string;
          noSubTitle: string;
          openTime: number;
          closeTime: number;
          expirationTime: number;
          status: string;
          volume: number;
          result: string;
          openInterest: number;
          [key: string]: any;
        }>;
      };
    }>(`/dflow/event/${encodeURIComponent(eventTicker)}${queryString ? `?${queryString}` : ''}`);
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
    return this.request<{
      success: boolean;
      trades: any[];
    }>(`/trades?${queryString}`);
  }

  // Authentication methods
  async sendVerificationCode(email: string, username?: string) {
    return this.request<{ success: boolean; message: string }>('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email, username }),
    });
  }

  async verifyCode(email: string, code: string) {
    return this.request<{
      success: boolean;
      token: string;
      refreshToken: string;
      user: any;
      wallet: any;
    }>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await this.request<{
        success: boolean;
        token: string;
      }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success && response.token) {
        this.setAccessToken(response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async getCurrentUser() {
    return this.request<{
      success: boolean;
      user: any;
      wallet: any;
    }>('/auth/me');
  }

  async logout() {
    try {
      await this.request<{ success: boolean }>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.setAccessToken(null);
      localStorage.removeItem('refreshToken');
    }
  }

  async getWalletBalance() {
    return this.request<{
      success: boolean;
      balance: {
        sol: number;
        usdc: number;
      };
    }>('/auth/wallet/balance');
  }

  async withdrawSOL(toAddress: string, amount: number) {
    return this.request<{
      success: boolean;
      message: string;
      signature: string;
      fee: number;
    }>('/auth/wallet/withdraw-sol', {
      method: 'POST',
      body: JSON.stringify({ toAddress, amount }),
    });
  }

  async withdrawUSDC(toAddress: string, amount: number) {
    return this.request<{
      success: boolean;
      message: string;
      signature: string;
      fee: number;
    }>('/auth/wallet/withdraw-usdc', {
      method: 'POST',
      body: JSON.stringify({ toAddress, amount }),
    });
  }

  // Trading methods
  async getOrder(params: {
    userPublicKey: string;
    inputMint: string;
    outputMint: string;
    amount: number;
    slippageBps?: number;
    predictionMarketSlippageBps?: number;
    wrapAndUnwrapSol?: boolean;
    prioritizationFeeLamports?: string | number;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('userPublicKey', params.userPublicKey);
    queryParams.append('inputMint', params.inputMint);
    queryParams.append('outputMint', params.outputMint);
    queryParams.append('amount', params.amount.toString());
    
    if (params.slippageBps !== undefined) {
      queryParams.append('slippageBps', params.slippageBps.toString());
    }
    if (params.predictionMarketSlippageBps !== undefined) {
      queryParams.append('predictionMarketSlippageBps', params.predictionMarketSlippageBps.toString());
    }
    if (params.wrapAndUnwrapSol !== undefined) {
      queryParams.append('wrapAndUnwrapSol', params.wrapAndUnwrapSol.toString());
    }
    if (params.prioritizationFeeLamports !== undefined) {
      queryParams.append('prioritizationFeeLamports', params.prioritizationFeeLamports.toString());
    }

    const queryString = queryParams.toString();
    return this.request<{
      contextSlot: number;
      executionMode: 'sync' | 'async';
      inAmount: string;
      inputMint: string;
      minOutAmount: string;
      otherAmountThreshold: string;
      outAmount: string;
      outputMint: string;
      priceImpactPct: string;
      slippageBps: number;
      transaction?: string;
      computeUnitLimit?: number;
      prioritizationFeeLamports?: number;
      revertMint?: string;
      routePlan?: any[];
    }>(`/dflow/order?${queryString}`);
  }

  async submitSignedTransaction(params: {
    signedTransaction: string;
    userPublicKey: string;
  }) {
    return this.request<{
      success: boolean;
      signature: string;
      message?: string;
    }>('/dflow/submit-transaction', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Get quote for a trade (no execution)
  async getTradeQuote(params: {
    inputMint: string;
    outputMint: string;
    amount: number;
    predictionMarketSlippageBps?: number;
  }) {
    const queryParams = new URLSearchParams({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount.toString(),
      predictionMarketSlippageBps: (params.predictionMarketSlippageBps || 100).toString(),
    });

    return this.request<{
      success: boolean;
      quote: {
        inAmount: string;
        outAmount: string;
        priceImpactPct: string;
        platformFee: any;
        slippageBps: number;
        inputMint: string;
        outputMint: string;
        minOutAmount: string;
        otherAmountThreshold: string;
      };
    }>(`/dflow/quote?${queryParams.toString()}`);
  }

  // Execute a trade - backend signs and submits
  async executeTrade(params: {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippageBps?: number;
    ticker?: string;
    marketTitle?: string;
    eventTitle?: string;
    eventTicker?: string;
    side?: string;
    outcome?: string;
    platformFee?: number;
  }) {
    return this.request<{
      success: boolean;
      signature: string;
      executionMode: string;
      outAmount: string;
      inAmount: string;
      priceImpactPct: string;
      quote: {
        inputAmount: string;
        outputAmount: string;
        priceImpact: string;
        executionMode: string;
      };
    }>('/dflow/execute-trade', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Get user's prediction market positions
  async getPositions(): Promise<{
    success: boolean;
    positions: Array<{
      mint: string;
      balance: number;
      decimals: number;
      position: 'YES' | 'NO' | 'UNKNOWN';
      isRedeemable: boolean;
      market: {
        ticker: string;
        eventTicker: string;
        title: string;
        subtitle: string;
        category: string;
        status: string;
        result?: string;
        volume: number;
        openInterest: number;
        closeTime: number;
        openTime: number;
        yesAsk?: string;
        yesBid?: string;
        noAsk?: string;
        noBid?: string;
      } | null;
    }>;
    count: number;
    message?: string;
  }> {
    return this.request('/positions', {
      method: 'GET',
    });
  }

  // Redeem determined prediction market position
  async redeemPosition(data: {
    mint: string;
    amount: number;
  }): Promise<{
    success: boolean;
    signature?: string;
    executionMode?: 'sync' | 'async';
    outAmount?: string;
    inAmount?: string;
    error?: string;
    message?: string;
  }> {
    return this.request('/redeem-position', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get order status (for async trades)
  async getOrderStatus(signature: string): Promise<{
    success: boolean;
    data?: {
      status: string;
      signature: string;
    };
    error?: string;
  }> {
    return this.request(`/dflow/order-status?signature=${signature}`, {
      method: 'GET',
    });
  }

  // Comment methods
  async getComments(eventId: string, limit: number = 50, offset: number = 0) {
    return this.request<{
      success: boolean;
      comments: any[];
      total: number;
      hasMore: boolean;
    }>(`/comments/${eventId}?limit=${limit}&offset=${offset}`);
  }

  async postComment(eventId: string, content: string, replyToCommentId?: string) {
    return this.request<{
      success: boolean;
      message: string;
      comment: any;
    }>('/comments', {
      method: 'POST',
      body: JSON.stringify({
        eventId,
        content,
        replyToCommentId: replyToCommentId || null,
      }),
    });
  }

  async deleteComment(commentId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async updateProfile(data: { username?: string; profilePicture?: string }) {
    return this.request<{
      success: boolean;
      user: {
        id: string;
        email: string;
        username?: string;
        profilePicture?: string;
      };
      error?: string;
    }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadProfilePicture(file: File): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${this.baseUrl}/auth/upload-profile-picture`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      },
      body: formData, // Don't set Content-Type, let browser set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  }

  async likeComment(commentId: string) {
    return this.request<{
      success: boolean;
      likes: number;
      message: string;
      error?: string;
    }>(`/comments/${commentId}/like`, {
      method: 'POST',
    });
  }

  async unlikeComment(commentId: string) {
    return this.request<{
      success: boolean;
      likes: number;
      message: string;
      error?: string;
    }>(`/comments/${commentId}/like`, {
      method: 'DELETE',
    });
  }

  // Get user's trade history
  async getUserTrades() {
    return this.request<{
      success: boolean;
      trades: Array<{
        _id: string;
        userId: string;
        ticker: string;
        marketTitle?: string;
        eventTicker?: string;
        side: 'buy' | 'sell';
        outcome: 'yes' | 'no';
        amount: number;
        shares: number;
        price: number;
        signature: string;
        timestamp: string;
        createdAt: string;
      }>;
      count: number;
    }>('/trades/user', {
      method: 'GET',
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

  // Search events by query string
  async searchEvents(query: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);

    return this.request<{
      success: boolean;
      results: Array<{
        ticker: string;
        title: string;
        type: 'event' | 'market';
        eventTicker?: string;
        eventTitle?: string;
        imageUrl?: string;
      }>;
    }>(`/events/search?${queryParams.toString()}`);
  }

  // Get saved events by tickers (returns imageUrl and gifUrl from database)
  async getEventsByTickers(tickers: string[]) {
    return this.request<{
      success: boolean;
      events: Array<{
        ticker: string;
        title: string;
        imageUrl?: string;
        gifUrl?: string;
      }>;
    }>('/events/by-tickers', {
      method: 'POST',
      body: JSON.stringify({ tickers }),
    });
  }

  async getFeatured() {
    return this.request<{
      success: boolean;
      tickers: string[];
    }>('/featured');
  }

  // Check if event exists in database and get its data (including imageUrl)
  async checkEventExists(ticker: string) {
    return this.request<{
      success: boolean;
      exists: boolean;
      event: {
        _id: string;
        ticker: string;
        title?: string;
        imageUrl?: string;
        createdAt: string;
        updatedAt: string;
      } | null;
    }>(`/events/check/${ticker}`);
  }

  // Close empty token accounts and reclaim rent to admin wallet
  async closeTokenAccounts(): Promise<{
    success: boolean;
    message?: string;
    closedCount: number;
    signature?: string;
    reclaimedLamports?: number;
    reclaimedSOL?: number;
    adminWallet?: string;
    error?: string;
  }> {
    return this.request('/close-token-accounts', {
      method: 'POST',
    });
  }

  // Close worthless positions (burn + close)
  async closeWorthlessPositions(mints: string[]): Promise<{
    success: boolean;
    message?: string;
    closedCount: number;
    signature?: string;
    adminWallet?: string;
    error?: string;
  }> {
    return this.request('/close-worthless-positions', {
      method: 'POST',
      body: JSON.stringify({ mints }),
    });
  }
  // Fetch news articles for given event titles
  async getNews(titles: string[]): Promise<{
    success: boolean;
    results: Array<{
      eventTitle: string;
      articles: Array<{
        source: { id: string | null; name: string };
        author: string | null;
        title: string;
        description: string | null;
        url: string;
        urlToImage: string | null;
        publishedAt: string;
      }>;
    }>;
  }> {
    const params = new URLSearchParams({ titles: titles.join(',') });
    return this.request(`/news?${params.toString()}`);
  }

  async checkGeoblock(): Promise<{
    success: boolean;
    blocked: boolean;
    countryCode: string | null;
    countryName: string;
    message: string;
  }> {
    return this.request('/geoblock/check');
  }

  // ============= Proof KYC Methods =============

  /**
   * Get a Proof KYC signature for the current user's wallet
   * This signature is generated on the backend using the user's server-managed wallet
   */
  async getProofSignature(): Promise<{
    success: boolean;
    walletAddress: string;
    signature: string;
    timestamp: number;
  }> {
    return this.request('/kyc/proof/signature', { method: 'POST' });
  }

  /**
   * Check the current user's KYC verification status
   * This queries the Proof API and updates the user's KYC status in the database
   */
  async checkKycStatus(): Promise<{
    success: boolean;
    isKycVerified: boolean;
    walletAddress: string;
  }> {
    return this.request('/kyc/status');
  }
}

export const apiClient = new ApiClient();

