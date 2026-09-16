const NEWS_API_KEY = process.env.NEWS_API_KEY || 'ee943e900c22437ebfe604c8b2ba44f1';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export class NewsService {
  /**
   * Search for news articles by keyword
   * @param query - Search query/keyword
   * @param options - Additional search options
   */
  static async searchNews(
    query: string,
    options: {
      from?: string;
      to?: string;
      sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
      language?: string;
      pageSize?: number;
      page?: number;
    } = {}
  ): Promise<NewsResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        apiKey: NEWS_API_KEY,
        sortBy: options.sortBy || 'popularity',
        language: options.language || 'en',
        pageSize: (options.pageSize || 20).toString(),
        page: (options.page || 1).toString(),
      });

      if (options.from) {
        params.append('from', options.from);
      }

      if (options.to) {
        params.append('to', options.to);
      }

      const response = await fetch(`${NEWS_API_BASE_URL}/everything?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to fetch news:', errorData);
        throw new Error('Failed to fetch news from NewsAPI');
      }
      return await response.json() as NewsResponse;
    } catch (error: any) {
      console.error('Failed to fetch news:', error.message);
      throw new Error('Failed to fetch news from NewsAPI');
    }
  }

  /**
   * Get top headlines by country or category
   * @param options - Filter options
   */
  static async getTopHeadlines(
    options: {
      country?: string;
      category?: 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology';
      sources?: string;
      q?: string;
      pageSize?: number;
      page?: number;
    } = {}
  ): Promise<NewsResponse> {
    try {
      const params = new URLSearchParams({
        apiKey: NEWS_API_KEY,
        pageSize: (options.pageSize || 20).toString(),
        page: (options.page || 1).toString(),
      });

      if (options.country) {
        params.append('country', options.country);
      }

      if (options.category) {
        params.append('category', options.category);
      }

      if (options.sources) {
        params.append('sources', options.sources);
      }

      if (options.q) {
        params.append('q', options.q);
      }

      const response = await fetch(`${NEWS_API_BASE_URL}/top-headlines?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to fetch top headlines:', errorData);
        throw new Error('Failed to fetch top headlines from NewsAPI');
      }
      return await response.json() as NewsResponse;
    } catch (error: any) {
      console.error('Failed to fetch top headlines:', error.message);
      throw new Error('Failed to fetch top headlines from NewsAPI');
    }
  }
}
