'use client';

import * as stylex from "@stylexjs/stylex";
import { apiClient } from "@/lib/api/client";
import { useEffect, useState, useRef, useMemo, useCallback, Suspense } from "react";
import EventCardsGrid from "@/components/EventCardsGrid";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import MiniLineChart from "@/components/MiniLineChart";
import { FadeIn } from "@/components/FadeIn";
import STMainPageError from "@/components/layout/STMainPageError";
import DiscoverGrid from "@/components/DiscoverGrid";
import DiscoverCard from "@/components/DiscoverCard";
import TrendingList from "@/components/TrendingList";
import { STLiveDot } from "@/components/STLiveDot";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { FEATURED_VOLUME_TEXT, FEATURED_VOLUME_TEXT_OFFSET } from "@/lib/colors";

const styles = stylex.create({
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#000000",
  },
  mainContent: {
    overflow:"hidden",
    flex: 1,
    padding: "0rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "1250px",
    boxSizing: "border-box",
    paddingLeft: "1.25rem",
    paddingRight: "1.25rem",
    "@media (max-width: 768px)": {
      paddingRight: "1rem",
      paddingLeft: "1rem",
    },
  },
  categoriesOuterWrapper: {
    position: "relative",
    width: "100%",
    marginTop: 0,
    marginBottom: "0.5rem",
    maxWidth: "100%",
    "@media (max-width: 768px)": {
      marginLeft: "-0.5rem",
      marginRight: "-0.5rem",
      width: "100vw",
      maxWidth: "100vw",
      marginBottom: "0.5rem",
    },
    "@media (min-width: 769px)": {
      marginBottom: "1.5rem",
    },
  },
  categoriesContainer: {
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: "0.25rem",
    WebkitOverflowScrolling: "touch",
    maxWidth: "100%",
  },
  categoriesFade: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "60px",
    pointerEvents: "none",
    backgroundImage: "linear-gradient(to left, #000000, rgba(0, 0, 0, 0))",
    zIndex: 10,
  },
  categoriesWrapper: {
    display: "flex",
    gap: "0.75rem",
    paddingLeft: "0rem",
    paddingRight: "0.5rem",
    "@media (min-width: 769px)": {
      justifyContent: "center",
    },
    "@media (max-width: 768px)": {
      gap: "0.5rem",
      paddingLeft: "1rem",

    },
  },
  categoryButton: {
    padding: "0.25rem 0.625rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.2s",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#262626",
    backgroundColor: "transparent",
    color: "#fafafa",
    whiteSpace: "nowrap",
    flexShrink: 0,
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderColor: "#262626",
    },
    ":active": {
      transform: "scale(0.95)",
    },
    "@media (max-width: 768px)": {
      padding: "0.25rem 0.5rem",
      fontSize: "0.8125rem",
      ":hover": {
        transform: "scale(0.95)",
      },
      ":active": {
        transform: "scale(0.9)",
      },
    },
  },
  categoryButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "#fafafa",
  },
  slideshowWrapper: {
    width: "100%",
    maxWidth: "950px",
    margin: "0 auto",
    marginBottom: "0rem",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    height: "450px",
    transition: "height 0.6s ease",
    "@media (max-width: 768px)": {
      minHeight: "400px",
      height: "400px",
      maxWidth:"500"
    },
  },
  slide: {
    backgroundColor: "transparent",
    borderRadius: "0.5rem",
    padding: 0,
    cursor: "pointer",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "100%",
    minHeight: "320px",
    display: "flex",
    flexDirection: "column",
    "@media (min-width: 768px)": {
      padding: 0,
      minHeight: "400px",
    },
  },
  slideTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#fafafa",
    margin: 0,
    marginBottom: "0.5rem",
    textAlign: "left",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.2,
    "@media (max-width: 768px)": {
      fontSize: "1.375rem",
      marginTop: "1rem",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      maxWidth: "100%",
    },
  },
  slideChartWrapper: {
    width: "100%",
    maxWidth: "100%",
    padding: 0,
    margin: 0,
    overflow: "hidden",
    boxSizing: "border-box",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  slideDots: {
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    marginTop: "0rem",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#333333",
    cursor: "pointer",
    transitionProperty: "background-color, width",
    transitionDuration: "300ms",
  },
  dotActive: {
    backgroundColor: "#60a5fa",
    width: "18px",
    borderRadius: "3px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "3rem",
  },
  loadingText: {
    color: "#a3a3a3",
    fontSize: "0.875rem",
  },
  errorBadge: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "3rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 400,
    color: "#7a7a7a",
  },
  errorCenterWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "55vh",
    width: "100%",
  },
});

interface KalshiMarket {
  ticker: string;
  yes_sub_title: string;
  yes_ask_dollars: string;
  yes_bid_dollars: string;
  last_price_dollars: string;
  volume_fp: string;
  volume_24h_fp: string;
  open_interest: number;
  liquidity: number;
  [key: string]: any;
}

interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  title: string;
  sub_title: string;
  imageUrl?: string;
  markets?: KalshiMarket[];
  [key: string]: any;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  tickers: string[];
  createdAt: string;
  updatedAt: string;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  const [liveMarkets, setLiveMarkets] = useState<KalshiEvent[]>([]);
  const [searchResults, setSearchResults] = useState<KalshiEvent[]>([]);
  const [categoryEvents, setCategoryEvents] = useState<KalshiEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savedTickers, setSavedTickers] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCategory') || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const [sortBy, setSortBy] = useState<'default' | 'volume' | 'closing_soon'>('default');
  const [sortOpen, setSortOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [newsResults, setNewsResults] = useState<Array<{
    eventTitle: string;
    articles: Array<{
      source: { id: string | null; name: string };
      title: string;
      description: string | null;
      url: string;
      urlToImage: string | null;
      publishedAt: string;
    }>;
  }>>([]);
  const [featuredEvents, setFeaturedEvents] = useState<KalshiEvent[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(new Set());
  const [pendingSlide, setPendingSlide] = useState<number | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [slideshowInitiallyLoaded, setSlideshowInitiallyLoaded] = useState(false);
  const [marketTitles, setMarketTitles] = useState<Record<string, Record<string, string>>>({});
  const [marketImages, setMarketImages] = useState<Record<string, string>>({});
  const [eventGifs, setEventGifs] = useState<Record<string, string>>({});
  const slideshowTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const EVENTS_PER_PAGE = 24;

  // Helper to get the image URL for an event
  const getEventImageUrl = (event: KalshiEvent): string | null => {
    // First, check if any market has an image in metadata
    if (event.markets && event.markets.length > 0) {
      for (const market of event.markets) {
        if ((market as any).imageUrl || (market as any).image) {
          return (market as any).imageUrl || (market as any).image;
        }
      }
    }
    // Fall back to event-level imageUrl
    return event.imageUrl || null;
  };

  // Helper to calculate total volume for an event (memoized to prevent recreation)
  const getTotalVolume = useCallback((event: KalshiEvent): number => {
    return event.markets?.reduce((sum: number, m: any) => sum + parseFloat(m.volume_fp || '0'), 0) || 0;
  }, []);

  // Helper to get highest price for an event (memoized)
  const getHighestPrice = useCallback((event: KalshiEvent): number => {
    if (event.markets && event.markets.length > 0) {
      const maxPrice = Math.max(
        ...event.markets
          .map(m => parseFloat(m.last_price_dollars || '0') * 100)
          .filter(val => !isNaN(val))
      );
      return maxPrice;
    }
    return 0;
  }, []);

  // Helper to merge event data with saved event data (imageUrl, gifUrl)
  const mergeEventWithSaved = useCallback((
    result: any,
    savedEventsMap: Map<string, any>
  ): KalshiEvent | null => {
    const markets = result.event?.markets || result.markets;
    if (!markets || markets.length === 0) return null;

    const savedEvent = savedEventsMap.get(result.event?.event_ticker);
    return {
      ...result.event,
      markets,
      imageUrl: savedEvent?.imageUrl || result.event?.imageUrl,
    };
  }, []);

  // Helper to build GIFs map from saved events
  const buildGifsMap = useCallback((savedEvents: any[]): Record<string, string> => {
    const gifsMap: Record<string, string> = {};
    savedEvents.forEach(savedEvent => {
      if (savedEvent.gifUrl) {
        gifsMap[savedEvent.ticker] = savedEvent.gifUrl;
      }
    });
    return gifsMap;
  }, []);

  // Derive filteredMarkets from current mode (search/category/live)
  const filteredMarkets = useMemo(() => {
    // Priority 1: Active search query shows search results
    if (searchQuery) return searchResults;
    // Priority 2: Selected category shows category events
    if (selectedCategory) return categoryEvents;
    // Priority 3: Default to live markets
    return liveMarkets;
  }, [searchQuery, searchResults, selectedCategory, categoryEvents, liveMarkets]);

  // Ensure we're mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save selected category to localStorage
  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem('selectedCategory', selectedCategory);
    } else {
      localStorage.removeItem('selectedCategory');
    }
  }, [selectedCategory]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const result = await apiClient.getCategories();
      if (result.success && result.categories) {
        setCategories(result.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Fetch featured events for slideshow
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const result = await apiClient.getFeatured();
        if (!result.success || result.tickers.length === 0) return;

        const top3 = result.tickers.slice(0, 3);

        // Fetch full event data + saved imageUrls in parallel
        const [eventResults, savedResult] = await Promise.all([
          Promise.all(
            top3.map(ticker =>
              apiClient.getEventData(ticker, true).catch(() => null)
            )
          ),
          apiClient.getEventsByTickers(top3),
        ]);

        const savedMap = new Map(
          savedResult.events.map(e => [e.ticker, e])
        );

        const events: KalshiEvent[] = eventResults
          .filter((r): r is NonNullable<typeof r> => r !== null)
          .map(r => mergeEventWithSaved(r, savedMap))
          .filter((e): e is KalshiEvent => e !== null);

        setFeaturedEvents(events);
      } catch (err) {
        console.error('Failed to fetch featured events:', err);
      }
    };

    fetchFeatured();
  }, []);

  // Mark slides with no markets as immediately loaded
  useEffect(() => {
    featuredEvents.forEach((event, i) => {
      if (!event.markets || event.markets.length === 0) {
        setLoadedSlides(prev => {
          const updated = new Set(prev).add(i);
          // Mark slideshow as initially loaded when first slide is ready
          if (i === 0 && !slideshowInitiallyLoaded) {
            setSlideshowInitiallyLoaded(true);
          }
          return updated;
        });
      }
    });
  }, [featuredEvents, slideshowInitiallyLoaded]);

  // Auto-advance slideshow: queue next slide as pending
  useEffect(() => {
    if (featuredEvents.length <= 1) return;

    slideshowTimer.current = setInterval(() => {
      setPendingSlide(prev => {
        if (prev !== null) return prev; // already waiting on one
        return (activeSlide + 1) % featuredEvents.length;
      });
    }, 6000);

    return () => {
      if (slideshowTimer.current) clearInterval(slideshowTimer.current);
    };
  }, [featuredEvents.length, activeSlide]);

  // Resolve pending slide once it has loaded — sequential fade out then in
  useEffect(() => {
    if (pendingSlide !== null && loadedSlides.has(pendingSlide) && fadeTimerRef.current === null) {
      setFadingOut(true);
      fadeTimerRef.current = setTimeout(() => {
        setActiveSlide(pendingSlide);
        setPendingSlide(null);
        setFadingOut(false);
        fadeTimerRef.current = null;
      }, 600);
    }
  }, [pendingSlide, loadedSlides]);

  // Stable sorted markets per featured slide — computed once when featuredEvents settles
  const slideshowMarkets = useMemo(() =>
    featuredEvents.map(event =>
      (event.markets || [])
        .slice()
        .sort((a: any, b: any) => {
          // Primary sort: by volume (descending)
          const aVolume = parseFloat(a?.volume_fp ?? '0');
          const bVolume = parseFloat(b?.volume_fp ?? '0');
          if (bVolume !== aVolume) {
            return bVolume - aVolume;
          }
          // Secondary sort: by probability/chance (closest to 50% = most competitive)
          const aChance = Math.abs(50 - ((Number.parseFloat(a?.yes_ask_dollars ?? a?.yesAsk ?? '0') * 100) || 0));
          const bChance = Math.abs(50 - ((Number.parseFloat(b?.yes_ask_dollars ?? b?.yesAsk ?? '0') * 100) || 0));
          return aChance - bChance;
        })
        .map((m: any) => ({
          ticker: m.ticker,
          title: m.yes_sub_title || m.title,
          yesSubTitle: m.yes_sub_title,
          openTime: m.open_time,
        }))
    ), [featuredEvents]);

  // Fetch events based on search query
  const fetchSearchResults = async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      // Get search results
      const searchResult = await apiClient.searchEvents(query);

      if (!searchResult.success || !searchResult.results || searchResult.results.length === 0) {
        setSearchResults([]);
        setError('No events found matching your search');
        return;
      }

      // Extract unique event tickers from search results
      const eventTickers = Array.from(
        new Set(
          searchResult.results.map(result =>
            result.type === 'event' ? result.ticker : result.eventTicker
          ).filter(Boolean) as string[]
        )
      );

      // Fetch saved events to get imageUrls
      const savedEventsResult = await apiClient.getEventsByTickers(eventTickers);
      const savedEventsMap = new Map(
        savedEventsResult.events.map(event => [event.ticker, event])
      );

      // Fetch all events from Kalshi API in parallel
      const eventPromises = eventTickers.map(ticker =>
        apiClient.getEventData(ticker, true).catch(err => {
          console.error(`Failed to fetch event ${ticker}:`, err);
          return null;
        })
      );

      const eventResults = await Promise.all(eventPromises);

      // Extract and format events, merging imageUrl from saved events
      const searchEvents: KalshiEvent[] = eventResults
        .filter(result => result !== null)
        .map(r => mergeEventWithSaved(r, savedEventsMap))
        .filter((e): e is KalshiEvent => e !== null);

      // Build GIF URLs map from saved events
      const gifsMap = buildGifsMap(savedEventsResult.events);

      // Sort by relevance (events that directly matched the search appear first)
      const directMatches = searchResult.results
        .filter(r => r.type === 'event')
        .map(r => r.ticker);

      const sortedEvents = searchEvents.sort((a, b) => {
        const aIsDirectMatch = directMatches.includes(a.event_ticker);
        const bIsDirectMatch = directMatches.includes(b.event_ticker);
        if (aIsDirectMatch && !bIsDirectMatch) return -1;
        if (!aIsDirectMatch && bIsDirectMatch) return 1;
        return 0;
      });

      setSearchResults(sortedEvents);
      setEventGifs(prev => ({ ...prev, ...gifsMap })); // Merge GIFs instead of replacing
      setHasMore(false); // Disable infinite scroll for search results
    } catch (err) {
      setError('Unable to load search results');
      console.error('Failed to fetch search results:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch and filter markets by selected category
  useEffect(() => {
    // Don't apply category filtering if there's an active search
    if (searchQuery) return;

    const fetchCategoryEvents = async () => {
      if (!selectedCategory) {
        // Reset to all events and re-enable infinite scroll
        setCategoryEvents([]);
        setHasMore(offset < totalEvents);
        return;
      }

      const category = categories.find(cat => cat.slug === selectedCategory);
      if (!category) {
        setCategoryEvents([]);
        return;
      }

      try {
        setLoading(true);
        setHasMore(false); // Disable infinite scroll for categories

        // Fetch all events for the category's tickers
        const eventPromises = category.tickers.map(ticker =>
          apiClient.getEventData(ticker, true).catch(err => {
            console.error(`Failed to fetch event ${ticker}:`, err);
            return null;
          })
        );

        const eventResults = await Promise.all(eventPromises);

        // Fetch saved events to get imageUrls from MongoDB
        const savedEventsResult = await apiClient.getEventsByTickers(category.tickers);
        const savedEventsMap = new Map(
          savedEventsResult.events.map(event => [event.ticker, event])
        );

        // Filter out null results and extract events, merging imageUrl from saved events
        const categoryEvents: KalshiEvent[] = eventResults
          .filter(result => result !== null)
          .map(r => mergeEventWithSaved(r, savedEventsMap))
          .filter((e): e is KalshiEvent => e !== null);

        // Build GIF URLs map from saved events
        const gifsMap = buildGifsMap(savedEventsResult.events);

        // Sort by last_price (highest first)
        const sortedEvents = categoryEvents.sort((a, b) => {
          const aPrice = getHighestPrice(a);
          const bPrice = getHighestPrice(b);

          return bPrice - aPrice;
        });

        setCategoryEvents(sortedEvents);
        setEventGifs(prev => ({ ...prev, ...gifsMap })); // Merge GIFs instead of replacing
      } catch (err) {
        console.error('Failed to fetch category events:', err);
        setCategoryEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryEvents();
  }, [selectedCategory, categories, liveMarkets, offset, totalEvents, searchQuery]);

  // Fetch live markets based on saved tickers with pagination
  const fetchLiveMarkets = async (isLoadingMore: boolean = false) => {
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Get saved tickers with pagination
      const savedResult = await apiClient.getSavedEvents({
        limit: EVENTS_PER_PAGE,
        offset: isLoadingMore ? offset : 0
      });

      // Track saved tickers for category filtering
      if (!isLoadingMore) {
        setSavedTickers(new Set(savedResult.events.map(e => e.ticker)));
      } else {
        setSavedTickers(prev => {
          const updated = new Set(prev);
          savedResult.events.forEach(e => updated.add(e.ticker));
          return updated;
        });
      }

      // Update total and hasMore
      setTotalEvents(savedResult.total || savedResult.count);
      const newOffset = (isLoadingMore ? offset : 0) + savedResult.events.length;
      setOffset(newOffset);
      setHasMore(newOffset < (savedResult.total || savedResult.count));

      if (savedResult.events.length === 0) {
        if (!isLoadingMore) {
          setLiveMarkets([]);
          setError('No saved events. Please contact the admin to add events.');
        }
        return;
      }

      // Fetch all events from Kalshi API in parallel
      const eventPromises = savedResult.events.map(savedEvent =>
        apiClient.getEventData(savedEvent.ticker, true).catch(err => {
          console.error(`Failed to fetch event ${savedEvent.ticker}:`, err);
          return null;
        })
      );

      const eventResults = await Promise.all(eventPromises);

      // Create saved events map for merging
      const savedEventsMap = new Map(
        savedResult.events.map(event => [event.ticker, event])
      );

      // Extract events from results and merge imageUrl from saved events
      const newEvents: KalshiEvent[] = eventResults
        .filter(result => result !== null)
        .map(r => mergeEventWithSaved(r, savedEventsMap))
        .filter((e): e is KalshiEvent => e !== null);

      // Build GIF URLs map from saved events
      const gifsMap = buildGifsMap(savedResult.events);

      // Sort by last_price (highest first)
      const sortedEvents = newEvents.sort((a, b) => {
        const aPrice = getHighestPrice(a);
        const bPrice = getHighestPrice(b);

        return bPrice - aPrice;
      });

      // Append or replace events (with deduplication)
      if (isLoadingMore) {
        setLiveMarkets(prev => {
          // Create a map of existing events by event_ticker to avoid duplicates
          const existingMap = new Map(prev.map(event => [event.event_ticker, event]));

          // Add new events, avoiding duplicates
          sortedEvents.forEach(event => {
            if (!existingMap.has(event.event_ticker)) {
              existingMap.set(event.event_ticker, event);
            }
          });

          return Array.from(existingMap.values());
        });
        // Merge GIF URLs when loading more
        setEventGifs(prev => ({ ...prev, ...gifsMap }));
      } else {
        setLiveMarkets(sortedEvents);
        setEventGifs(prev => ({ ...prev, ...gifsMap })); // Merge GIFs instead of replacing
      }
    } catch (err) {
      setError('Unable to load events');
      console.error("Failed to fetch live markets:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // Check if there's a search query
    if (searchQuery) {
      // Entering search mode - clear category events
      setCategoryEvents([]);
      fetchSearchResults(searchQuery);
    } else {
      // Exiting search mode - clear search results and fetch live markets
      setSearchResults([]);
      fetchLiveMarkets(false);
    }
  }, [searchQuery]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      // Don't load more if already loading, no more data, category is selected, or search is active
      if (loadingMore || !hasMore || selectedCategory || searchQuery) return;

      // Check if we're near the bottom (500px from bottom)
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < 500) {
        fetchLiveMarkets(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, selectedCategory, searchQuery, offset]);

  // Fetch news for top 10 events by volume
  useEffect(() => {
    if (filteredMarkets.length === 0 || searchQuery) return;

    // Sort by volume and pick top 10
    const sortedByVolume = [...filteredMarkets].sort((a, b) => {
      const volA = getTotalVolume(a);
      const volB = getTotalVolume(b);
      return volB - volA;
    });
    const picked = sortedByVolume.slice(0, 10);
    const titles = picked.map(e => e.title);

    apiClient.getNews(titles)
      .then(res => { if (res.success) setNewsResults(res.results); })
      .catch(err => console.error('Failed to fetch news:', err));
  }, [filteredMarkets, searchQuery]);

  // Sort markets based on selected sort option
  const sortedMarkets = useMemo(() => {
    if (sortBy === 'default') return filteredMarkets;

    return [...filteredMarkets].sort((a, b) => {
      if (sortBy === 'volume') {
        const volA = getTotalVolume(a);
        const volB = getTotalVolume(b);
        return volB - volA;
      }
      if (sortBy === 'closing_soon') {
        const timeA = (a.markets?.[0] as any)?.expiration_time || (a.markets?.[0] as any)?.close_time || Infinity;
        const timeB = (b.markets?.[0] as any)?.expiration_time || (b.markets?.[0] as any)?.close_time || Infinity;
        return new Date(timeA).getTime() - new Date(timeB).getTime();
      }
      return 0;
    });
  }, [filteredMarkets, sortBy]);

  // Filter categories to only show those with saved event tickers
  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.tickers.some(ticker => savedTickers.has(ticker))
    );
  }, [categories, savedTickers]);

  // Memoize discover event tickers - only changes when the top events change
  const discoverEventTickersString = useMemo(() => {
    if (filteredMarkets.length === 0) return '';

    const discoverEvents = filteredMarkets
      .filter(event => getEventImageUrl(event) !== null)
      .sort((a, b) => {
        const volA = getTotalVolume(a);
        const volB = getTotalVolume(b);
        return volB - volA;
      })
      .slice(0, 17); // Get top 17 events for discover + trending sections

    const tickers = Array.from(new Set(discoverEvents.map(e => e.event_ticker)));
    return tickers.join(',');
  }, [filteredMarkets]);

  const discoverEventTickers = useMemo(() => {
    if (!discoverEventTickersString) return [];
    return discoverEventTickersString.split(',');
  }, [discoverEventTickersString]); // This only changes when the tickers actually change

  // Memoized events for DiscoverGrid (prevents expensive filter+sort on every render)
  const discoverGridEvents = useMemo(() => {
    return filteredMarkets
      .filter(event => getEventImageUrl(event) !== null)
      .sort((a, b) => {
        const volA = getTotalVolume(a);
        const volB = getTotalVolume(b);
        return volB - volA;
      })
      .slice(0, 11);
  }, [filteredMarkets]);

  // Memoized events for embedded discover section (excludes first 20 event cards)
  const embeddedDiscoverEvents = useMemo(() => {
    // Get tickers from first 20 sorted markets
    const firstPageTickers = new Set(
      sortedMarkets.slice(0, 20).map(event => event.event_ticker)
    );

    // Filter events with images that aren't in the first page
    return filteredMarkets
      .filter(event =>
        getEventImageUrl(event) !== null &&
        !firstPageTickers.has(event.event_ticker)
      )
      .sort((a, b) => {
        const volA = getTotalVolume(a);
        const volB = getTotalVolume(b);
        return volB - volA;
      })
      .slice(0, 4); // Need 4 events (2 for col 1 after Discord card, 2 for col 2)
  }, [filteredMarkets, sortedMarkets]);

  // Fetch market titles and images for discover section
  useEffect(() => {
    const fetchMarketData = async () => {
      if (discoverEventTickers.length === 0) return;

      // Clear old data to prevent flash of event-level titles
      setMarketTitles({});
      setMarketImages({});
      // Don't clear eventGifs - it's managed by fetchLiveMarkets

      const eventTickers = discoverEventTickers;

      try {
        // Fetch dflow event data, metadata, and saved events for all events in parallel
        const [dflowResults, metadataResults, savedEventsResult] = await Promise.all([
          Promise.all(
            eventTickers.map(ticker =>
              apiClient.getDflowEvent(ticker, true, true).catch(() => null)
            )
          ),
          Promise.all(
            eventTickers.map(ticker =>
              apiClient.getEventMetadata(ticker).catch(() => null)
            )
          ),
          apiClient.getEventsByTickers(eventTickers),
        ]);

        // Build market titles map
        const titlesMap: Record<string, Record<string, string>> = {};
        dflowResults.forEach((result, index) => {
          if (result && result.success && result.data) {
            const eventTicker = eventTickers[index];
            titlesMap[eventTicker] = {};
            result.data.markets.forEach(market => {
              titlesMap[eventTicker][market.ticker] = market.title;
            });
          }
        });

        // Build market images map (market ticker -> image URL) for left column only
        const imagesMap: Record<string, string> = {};
        metadataResults.forEach((result) => {
          if (result && result.success && result.data && result.data.market_details) {
            result.data.market_details.forEach((detail: any) => {
              if (detail.image_url) {
                imagesMap[detail.market_ticker] = detail.image_url;
              }
            });
          }
        });

        setMarketTitles(titlesMap);
        setMarketImages(imagesMap);
        // eventGifs is managed by fetchLiveMarkets, not here
      } catch (err) {
        console.error('Failed to fetch market data:', err);
      }
    };

    fetchMarketData();
  }, [discoverEventTickers]);

  return (
    <div {...stylex.props(styles.layout)}>
      <main {...stylex.props(styles.mainContent)}>
        <div {...stylex.props(styles.contentWrapper)}>
          {/* Categories section - hide when searching, show all categories immediately */}
          {mounted && categories.length > 0 && !searchQuery && (
            <div {...stylex.props(styles.categoriesOuterWrapper)}>
              <div {...stylex.props(styles.categoriesContainer)}>
                <div {...stylex.props(styles.categoriesWrapper)}>
                  <button
                    {...stylex.props(
                      styles.categoryButton,
                      !selectedCategory && styles.categoryButtonActive
                    )}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      {...stylex.props(
                        styles.categoryButton,
                        selectedCategory === category.slug && styles.categoryButtonActive
                      )}
                      onClick={() => setSelectedCategory(category.slug)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              <div {...stylex.props(styles.categoriesFade)} />
            </div>
          )}

          {/* Featured slideshow + News two-column layout */}
          {mounted && !searchQuery && featuredEvents.length > 0 && (
            <div className="chart-news-row">
              {/* Left: MiniLineChart slideshow */}
              <div className="chart-news-chart">
                {/* Initial loading state - show logo only on first load */}
                {!slideshowInitiallyLoaded && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '450px',
                      marginBottom: '0rem',
                    }}
                  >
                    <div
                      style={{
                        animation: 'pulsate 2s ease-in-out infinite',
                      }}
                    >
                      <Image
                        src="/st-glyph.png"
                        alt="Loading"
                        width={48}
                        height={48}
                        priority
                      />
                    </div>
                  </div>
                )}
                <div
                  {...stylex.props(styles.slideshowWrapper)}
                  style={!slideshowInitiallyLoaded || !loadedSlides.has(activeSlide) ? { height: 0, overflow: 'hidden', marginBottom: 0 } : undefined}
                >
                  {featuredEvents.map((event, i) => {
                    const sortedMarkets = slideshowMarkets[i];
                    const isActive = i === activeSlide;
                    const isVisible = loadedSlides.has(i) && !fadingOut && isActive;

                    return (
                      <div
                        key={event.event_ticker}
                        {...stylex.props(styles.slide)}
                        style={{
                          position: isActive ? 'relative' : 'absolute',
                          top: isActive ? undefined : 0,
                          left: isActive ? undefined : 0,
                          right: isActive ? undefined : 0,
                          opacity: isVisible ? 1 : 0,
                          transition: 'opacity 0.6s ease',
                          pointerEvents: isVisible ? 'auto' : 'none',
                          zIndex: isActive ? 1 : 0,
                        }}
                      >
                        <div className="slideshow-card-wrapper" onClick={() => router.push(`/events/${event.event_ticker}`)}>
                          <div className="slideshow-title-row">
                            <div className="slideshow-title-text">
                              <p {...stylex.props(styles.slideTitle)}>{event.title}</p>
                              {(() => {
                                const totalVolume = getTotalVolume(event);
                                const closeTime = (event.markets?.[0] as any)?.expiration_time || (event.markets?.[0] as any)?.close_time;

                                if ((totalVolume && totalVolume > 0) || closeTime) {
                                  return (
                                    <div className="slideshow-vol-info">
                                      {totalVolume && totalVolume > 0 && (
                                        <>
                                          <span style={{ color: FEATURED_VOLUME_TEXT }}>Vol $</span><span style={{ color: FEATURED_VOLUME_TEXT, textShadow: FEATURED_VOLUME_TEXT_OFFSET }}>{totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </>
                                      )}
                                      {totalVolume && totalVolume > 0 && closeTime && ' • '}
                                      {closeTime && (() => {
                                        try {
                                          const closeDate = new Date(closeTime);
                                          if (isNaN(closeDate.getTime())) return '';
                                          const month = closeDate.toLocaleDateString('en-US', { month: 'short' });
                                          const day = closeDate.getDate();
                                          const time = closeDate.toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                          }).replace(' ', '');
                                          return `${month} ${day} @ ${time}`;
                                        } catch (e) {
                                          return '';
                                        }
                                      })()}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>

                        {sortedMarkets.length > 0 && (
                          <div {...stylex.props(styles.slideChartWrapper)} style={{ position: 'relative' }}>
                            {event.imageUrl && (
                              <img
                                className="slideshow-title-image"
                                src={event.imageUrl}
                                alt={event.title}
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <MiniLineChart
                              interval="all"
                              markets={sortedMarkets}
                              eventTicker={event.event_ticker}
                              initiallyVisibleMarkets={sortedMarkets.slice(0, 3).map(m => m.ticker)}
                              volume={getTotalVolume(event)}
                              closeTime={(event.markets?.[0] as any)?.expiration_time || (event.markets?.[0] as any)?.close_time}
                              onLoaded={() => {
                                setLoadedSlides(prev => new Set(prev).add(i));
                                // Mark slideshow as initially loaded when first slide is ready
                                if (i === 0 && !slideshowInitiallyLoaded) {
                                  setSlideshowInitiallyLoaded(true);
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {featuredEvents.length > 1 && (
                    <>
                      <div className="slideshow-nav-container">
                        <div className="slideshow-nav-arrows">
                          <button
                            className="slideshow-nav-arrow"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (slideshowTimer.current) {
                                clearInterval(slideshowTimer.current);
                                slideshowTimer.current = null;
                              }
                              const prevSlide = activeSlide === 0 ? featuredEvents.length - 1 : activeSlide - 1;
                              setPendingSlide(prevSlide);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="15 18 9 12 15 6" />
                            </svg>
                          </button>
                          <button
                            className="slideshow-nav-arrow"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (slideshowTimer.current) {
                                clearInterval(slideshowTimer.current);
                                slideshowTimer.current = null;
                              }
                              const nextSlide = activeSlide === featuredEvents.length - 1 ? 0 : activeSlide + 1;
                              setPendingSlide(nextSlide);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {featuredEvents[activeSlide]?.imageUrl && (
                        <div className="slideshow-image-container">
                          <img
                            className="slideshow-nav-image"
                            src={featuredEvents[activeSlide].imageUrl}
                            alt={featuredEvents[activeSlide].title}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </>
                  )}
                  <div className="slideshow-nav-fade" />
                  <div className="slideshow-fade" />
                </div>
              </div>

              {/* Right: Trending Markets - Desktop Only */}
              {!isMobile && Object.keys(marketTitles).length > 0 && (
                <>
                  <div className="latest-news-header">Trending</div>
                  <div className="chart-news-news-wrapper">
                    <div className="trending-ticker">
                      {/* Duplicate content for seamless infinite loop */}
                      <TrendingList
                        events={filteredMarkets.filter((market: any) => market.imageUrl && !market.imageUrl.includes('fallback')).slice(11, 17)}
                        marketTitles={marketTitles}
                        marketImages={marketImages}
                        enableScrollFade={true}
                      />
                      <TrendingList
                        events={filteredMarkets.filter((market: any) => market.imageUrl && !market.imageUrl.includes('fallback')).slice(11, 17)}
                        marketTitles={marketTitles}
                        marketImages={marketImages}
                        enableScrollFade={true}
                      />
                    </div>
                    <div className="chart-news-news-fade" style={{ top: 'auto', bottom: 0, left: 0, width: '100%', height: '60px', background: 'linear-gradient(to top, #000, transparent)' }} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Search indicator */}
          {mounted && !loading && searchQuery && (
            <div style={{
              padding: '0.75rem 0.5rem',
              color: '#7a7a7a',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              Search results for: <span style={{ color: '#fafafa', fontWeight: 500 }}>"{searchQuery}"</span>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  marginLeft: '1rem',
                  color: 'white',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  textDecoration: 'underline',
                  fontSize: '0.875rem'
                }}
              >
                Clear search
              </button>
            </div>
          )}

          {(!mounted || loading) && (
            <div className="skeleton-grid">
              {Array.from({ length: 24 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    minHeight: '203px', // Match EventCardsGrid card minHeight
                    contain: 'layout style paint', // Prevent layout shift
                    animation: 'skeletonPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                />
              ))}
            </div>
          )}

          {mounted && !loading && error && (
            <div {...stylex.props(styles.errorCenterWrapper)}>
              <STMainPageError />
            </div>
          )}

          {mounted && !loading && !error && filteredMarkets.length > 0 && (
            <>
              {/* Discover Section - Only render when market data is ready */}
              {Object.keys(marketTitles).length > 0 && (
                <>
                  <div className="discover-header-row">
                    <div className="discover-header">
                      Discover
                      <svg className="header-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                    <STLiveDot showLabel size="large" />
                  </div>

                  {/* Discover Grid - Top events with images */}
                  <DiscoverGrid
                    events={discoverGridEvents}
                    marketTitles={marketTitles}
                    marketImages={marketImages}
                  />
                </>
              )}

              <div className="live-markets-header-row">
                <div className="live-markets-header">
                  Live Markets
                  {!isMobile && (
                    <svg className="header-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </div>
                <div className="sort-btn-wrap">
                  <button className="sort-btn" onClick={() => setSortOpen(!sortOpen)}>
                    Sort by {sortBy === 'default' ? 'Default' : sortBy === 'volume' ? 'Volume' : 'Closing Soon'}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: '0.35rem', transition: 'transform 150ms', transform: sortOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {sortOpen && (
                    <>
                      <div className="sort-backdrop" onClick={() => setSortOpen(false)} />
                      <div className="sort-dropdown">
                        {(['default', 'volume', 'closing_soon'] as const).map((option) => (
                          <button
                            key={option}
                            className={`sort-option${sortBy === option ? ' sort-option-active' : ''}`}
                            onClick={() => { setSortBy(option); setSortOpen(false); }}
                          >
                            {option === 'default' ? 'Default' : option === 'volume' ? 'Volume' : 'Closing Soon'}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* First page of event cards - 20 cards (5 rows of 4) */}
              <EventCardsGrid events={sortedMarkets.slice(0, 20)} />

              {/* Embedded Discover Section - only show if we have enough events */}
              {sortedMarkets.length > 20 && embeddedDiscoverEvents.length >= 4 && (
                <div className="embedded-discover-section">
                  {/* Column 1 - Discord card + 2 discover cards */}
                  <div className="embedded-discover-col-1">
                    {/* Discord Card */}
                    <div className="embedded-discover-card discord-card">
                      <a
                        href="https://discord.gg/sonotrade"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="discord-card-link"
                      >
                        <div className="discord-card-content">
                          <div className="discord-icon">
                            <svg width="64" height="64" viewBox="0 0 71 55" fill="none">
                              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="white"/>
                            </svg>
                          </div>
                          <h3 className="discord-card-title">Join our Discord</h3>
                          <p className="discord-card-description">
                            Connect with the community
                          </p>
                          <div className="discord-card-button">
                            Join Community →
                          </div>
                        </div>
                      </a>
                    </div>

                    {/* 2 Discover Cards */}
                    {embeddedDiscoverEvents.slice(0, 2).map((event, index) => (
                      <div key={event.event_ticker} className="embedded-discover-card">
                        <DiscoverCard
                          event={event}
                          index={index}
                          compact={true}
                          marketTitles={marketTitles ? marketTitles[event.event_ticker] : undefined}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Column 2 - 2 cards */}
                  <div className="embedded-discover-col-2">
                    {embeddedDiscoverEvents.slice(2, 4).map((event, index) => (
                      <div key={event.event_ticker} className="embedded-discover-card">
                        <DiscoverCard
                          event={event}
                          index={index + 2}
                          compact={true}
                          tallImage="8 / 5"
                          marketTitles={marketTitles ? marketTitles[event.event_ticker] : undefined}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Column 3 - Trending List */}
                  <div className="embedded-discover-col-3">
                    <TrendingList
                      events={filteredMarkets.filter((market: any) => market.imageUrl && !market.imageUrl.includes('fallback')).slice(11, 17)}
                      marketTitles={marketTitles}
                      marketImages={marketImages}
                    />
                  </div>
                </div>
              )}

              {/* Remaining event cards */}
              {sortedMarkets.length > 20 && (
                <EventCardsGrid events={sortedMarkets.slice(20)} />
              )}

              {loadingMore && (
                <div {...stylex.props(styles.loadingContainer)}>
                  <div
                    style={{
                      animation: 'pulsate 2s ease-in-out infinite',
                    }}
                  >
                    <Image
                      src="/st-glyph.png"
                      alt="Loading"
                      width={48}
                      height={48}
                      priority
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {mounted && !loading && !error && liveMarkets.length > 0 && filteredMarkets.length === 0 && !searchQuery && (
            <div {...stylex.props(styles.errorBadge)}>
              No live events in this category
            </div>
          )}
        </div>
        <style jsx>{`
          /* Chart + News two-column row */
          .chart-news-row {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .chart-news-chart {
            width: 100%;
          }

          @media (max-width: 768px) {
            .chart-news-row {
              margin-bottom: 0.75rem;
              gap: 0;
            }
            .chart-news-news {
              padding-bottom: 0;
            }
          }

          /* Mobile: horizontal scroll strip, cards are vertical */
          .latest-news-header {
            display: block;
            font-size: 1.5rem;
            font-weight: 700;
            color: #fafafa;
            margin-top: 0.5rem;
            margin-bottom: 0.75rem;
          }

          @media (max-width: 768px) {
            .latest-news-header {
              margin-bottom: 0rem;
            }
          }

          .chart-news-news-wrapper {
            position: relative;
            overflow: hidden;
          }

          @media (min-width: 769px) {
            .chart-news-news-wrapper {
              max-height: 600px;
              overflow-y: hidden;
            }

            .chart-news-news-wrapper:hover {
              overflow-y: auto;
            }

            @keyframes ticker-scroll {
              0% {
                transform: translateY(0);
              }
              100% {
                transform: translateY(-50%);
              }
            }

            .trending-ticker {
              animation: ticker-scroll 60s linear infinite;
            }

            .chart-news-news-wrapper:hover .trending-ticker {
              animation-play-state: paused;
            }

            /* Top fade */
            .chart-news-news-wrapper::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 60px;
              background: linear-gradient(to bottom, #000, transparent);
              pointer-events: none;
              z-index: 10;
            }

            /* Bottom fade - make sticky instead of absolute */
            .chart-news-news-fade {
              position: sticky !important;
              bottom: 0;
              display: block !important;
            }
          }

          .chart-news-news {
            display: flex;
            flex-direction: row;
            gap: 0.75rem;
            overflow-x: auto;
            padding-bottom: 0.25rem;
          }

          .chart-news-news > a {
            border: 1.5px solid #262626;
            border-radius: 0.5rem;
            pointer-events: none;
            cursor: default;
          }

          .chart-news-news-img {
            border-radius: 0.5rem 0.5rem 0 0 !important;
          }

          .chart-news-news-fade {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 60px;
            height: 100%;
            background: linear-gradient(to left, #000, transparent);
            pointer-events: none;
            z-index: 10;
          }

          .chart-news-news > a {
            flex-shrink: 0;
            width: 260px;
            flex-direction: column;
          }

          .chart-news-news-img {
            width: 100%;
            height: 140px;
          }

          .discover-header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 1.25rem;
            margin-bottom: 0.75rem;
          }

          .discover-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 1.5rem;
            font-weight: 700;
            color: #fafafa;
          }

          .header-arrow {
            color: #737373;
            margin-left: 0.5rem;
            margin-top: 0.25rem;
            display: block;
            flex-shrink: 0;
          }

          .embedded-discover-section {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 1rem;
            margin-top: 4rem;
            margin-bottom: 4rem;
            min-height: 400px;
          }

          .embedded-discover-col-1 {
            grid-column: span 4;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .embedded-discover-col-2 {
            grid-column: span 4;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .embedded-discover-col-3 {
            grid-column: span 4;
            border-top: 1px solid #262626;
            border-bottom: 1px solid #262626;
          }

          .embedded-discover-card {
            flex: 1;
            min-height: 0;
            overflow: visible;
          }

          .discord-card {
            background: #0a0a0a;
            border: 1.5px solid #262626;
            border-radius: 0.5rem;
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 500ms ease-out forwards;
            transition: border-color 200ms ease-out, transform 200ms ease-out;
          }

          .discord-card:hover {
            border-color: rgba(255, 255, 255, 0.42);
            transform: translateY(-2px);
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .discord-card-link {
            display: block;
            text-decoration: none;
            height: 100%;
          }

          .discord-card-content {
            padding: 1.5rem 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            height: 100%;
            justify-content: center;
            background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/monogram.png');
            background-repeat: repeat;
            background-size: 600px 600px;
            background-position: center;
            position: relative;
          }

          .discord-icon {
            margin-bottom: 0.75rem;
          }

          .discord-card-title {
            font-size: 1rem;
            font-weight: 700;
            color: #fafafa;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: -0.02em;
          }

          .discord-card-description {
            font-size: 0.75rem;
            color: #a3a3a3;
            line-height: 1.5;
            margin-bottom: 1rem;
          }

          .discord-card-button {
            display: inline-block;
            padding: 0.625rem 1.25rem;
            background: white;
            color: #0a0a0a;
            border-radius: 0.375rem;
            font-weight: 600;
            font-size: 0.8125rem;
            transition: transform 500ms ease-out, background 500ms ease-out;
          }

          .discord-card-link:hover .discord-card-button {
            transform: scale(1.1) translateY(-2px);
            background: #fafafa;
          }

          @media (max-width: 1024px) {
            .embedded-discover-section {
              grid-template-columns: repeat(1, 1fr);
              gap: 0.75rem;
              margin-top: 1rem;
              margin-bottom: 1rem;
            }

            .embedded-discover-col-1,
            .embedded-discover-col-2,
            .embedded-discover-col-3 {
              grid-column: span 1;
            }

            .embedded-discover-col-3 {
              border-top: none;
              border-bottom: none;
            }
          }

          .live-markets-header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 1.25rem;
            margin-bottom: 0.75rem;
            min-height: 2.5rem;
            contain: layout style;
            position: relative;
            z-index: 10;
          }

          .live-markets-header {
            display: flex;
            align-items: center;
            font-size: 1.5rem;
            font-weight: 700;
            color: #fafafa;
          }

          .sort-btn-wrap {
            position: relative;
            z-index: 100;
          }

          .sort-btn {
            display: flex;
            align-items: center;
            background: transparent;
            border: 1px solid #262626;
            border-radius: 0.5rem;
            color: #9ca3af;
            font-size: 0.75rem;
            padding: 0.6rem 0.75rem;
            cursor: pointer;
            transition: border-color 200ms, color 200ms;
          }

          .sort-btn:hover {
            border-color: rgba(255,255,255,0.42);
            color: #fafafa;
          }

          .sort-btn:active {
            transform: scale(0.9);
          }

          .sort-backdrop {
            position: fixed;
            inset: 0;
            z-index: 100;
          }

          .sort-dropdown {
            position: absolute;
            top: calc(100% + 0.25rem);
            right: 0;
            background: #000;
            border: 1px solid #262626;
            border-radius: 0.5rem;
            min-width: 150px;
            z-index: 101;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            animation: dropdown-in 200ms cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: top right;
          }

          .sort-option {
            display: block;
            width: 100%;
            text-align: left;
            background: transparent;
            border: none;
            color: #a3a3a3;
            font-size: 15px;
            padding: 0.625rem 1rem;
            cursor: pointer;
            transition: background 150ms, color 150ms;
          }

          .sort-option:first-child {
            border-radius: 0.5rem 0.5rem 0 0;
          }

          .sort-option:last-child {
            border-radius: 0 0 0.5rem 0.5rem;
          }

          .sort-option:hover {
            background: #101010;
            color: #fff;
          }

          .sort-option-active {
            background: #1a1a1a;
            color: #fff;
            font-weight: 500;
          }

          /* Desktop: two columns, news stacks vertically as rows */
          @media (min-width: 769px) {
            .slideshow-fade {
              display: none;
            }

            .latest-news-header {
              display: none;
            }

            .discover-header-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 0.5rem;
              margin-bottom: 1.25rem;
              padding-top: 2rem;
            }

            .discover-header {
              font-size: 2rem;
            }

            .live-markets-header-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 0.5rem;
              margin-bottom: 1.25rem;
              padding-top: 2rem;
            }

            .live-markets-header {
              font-size: 2rem;
            }

            .sort-btn {
              font-size: 0.8125rem;
              padding: 0.4rem 0.75rem;
            }

            .sort-btn:active {
              transform: scale(0.95);
            }

            .sort-dropdown {
              min-width: 160px;
            }

            .chart-news-row {
              margin-bottom: 0.5rem;
              flex-direction: row;
              align-items: stretch;
              gap: 1rem;
            }

            .chart-news-chart {
              flex: 2;
              min-width: 0;
            }

            .chart-news-news-wrapper {
              flex: 1;
              min-width: 0;
              max-height: 450px;
            }

            .chart-news-news {
              flex-direction: column;
              overflow-x: visible;
              overflow-y: auto;
              height: 100%;
              padding-bottom: 0;
              gap: 0.75rem;
            }

            .chart-news-news > a {
              border: none !important;
              pointer-events: none;
              cursor: default;
            }

            .chart-news-news-img {
              display: none;
            }
          }

          .slideshow-title-image {
            position: absolute;
            border-radius: 50%;
            object-fit: cover;
            filter: blur(4px);
            z-index: 0;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            mask-image: radial-gradient(circle, black 30%, transparent 70%);
            -webkit-mask-image: radial-gradient(circle, black 30%, transparent 70%);
          }

          @media (min-width: 769px) {
            .slideshow-title-image {
              width: 300px;
              height: 300px;
              opacity: 0.3;
            }

            .chart-news-news > a > div {
              padding: 0;
            }

            .chart-news-news-fade {
              top: auto;
              bottom: 0;
              right: auto;
              left: 0;
              width: 100%;
              height: 25px;
              background: linear-gradient(to top, #000, transparent);
            }

            .chart-news-news > a {
              width: 100%;
              flex-direction: row;
            }

            .chart-news-news-img {
              width: 100px;
              min-width: 100px;
              height: auto;
            }
          }

          .slideshow-fade {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 80px;
            background: linear-gradient(to top, #000, transparent);
            pointer-events: none;
            z-index: 2;
          }

          .slideshow-card-wrapper {
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 1;
          }

          .slideshow-title-row {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            gap: 1rem;
          }

          .slideshow-title-img {
            display: none;
          }

          .slideshow-title-text {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;
            overflow: hidden;
          }

          @media (max-width: 768px) {
            .slideshow-title-text {
              margin-left: 0.5rem;
              margin-right: 0.5rem;
            }

            .slideshow-legends {
              margin-left: 0.5rem !important;
              margin-right: 0.5rem !important;
            }
          }

          .slideshow-vol-info {
            font-size: 0.8125rem;
            color: #7a7a7a;
            text-align: left;
          }

          .slideshow-nav-container {
            position: absolute;
            bottom: 15px;
            right: 0;
            display: none;
            z-index: 10;
          }

          @media (min-width: 769px) {
            .slideshow-nav-container {
              display: flex;
            }
          }

          .slideshow-image-container {
            display: none !important;
          }

          .chart-news-news > a > div {
            padding: 0.625rem;
          }

          @media (max-width: 768px) {
            .slideshow-title-image {
              width: 200px;
              height: 200px;
              opacity: 0.25;
            }
          }

          @media (min-width: 769px) {
            .slideshow-image-container {
              display: block;
            }
          }

          .slideshow-nav-fade {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 120px;
            background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.5) 50%, #000 100%);
            pointer-events: none;
            z-index: 5;
            display: none;
          }

          @media (min-width: 769px) {
            .slideshow-nav-fade {
              display: block;
            }
          }

          .slideshow-nav-arrows {
            display: flex;
            gap: 0.5rem;
          }

          .slideshow-nav-arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background-color: transparent;
            border: 1.5px solid #262626;
            border-radius: 0.375rem;
            color: #fafafa;
            cursor: pointer;
            transition: all 200ms;
            padding: 0;
          }

          .slideshow-nav-arrow:hover {
            background-color: transparent;
            border-color: rgba(255, 255, 255, 0.42);
          }

          .slideshow-nav-arrow:active {
            transform: scale(0.95);
          }

          .slideshow-nav-image {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            object-fit: cover;
          }

          @media (min-width: 769px) {
            .slideshow-card-wrapper {
              background-color: transparent;
              overflow: hidden;
              width: fit-content;
              max-width: 100%;
              cursor: pointer;
              padding-bottom: 0.75rem;
            }

            .slideshow-title-text {
              height: auto;
              justify-content: center;
              padding: 0 1rem 0.875rem 0;
              gap: 0.125rem;
            }

            .slideshow-title-row p {
              margin: 0;
              padding: 0;
              line-height: 1.1;
            }

            .slideshow-vol-info {
              line-height: 1;
              margin: 0;
              padding: 0;
            }
          }

          .skeleton-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            width: 100%;
            min-height: 500px; /* Reserve space to prevent collapse */
            contain: layout style;
          }

          @media (max-width: 1536px) {
            .skeleton-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 1024px) {
            .skeleton-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 768px) {
            .skeleton-grid {
              gap: 0.5rem;
            }
          }

          @media (max-width: 640px) {
            .skeleton-grid {
              grid-template-columns: repeat(1, 1fr);
            }
          }

          @keyframes skeletonPulse {
            0%, 100% {
              opacity: 0.8;
            }
            50% {
              opacity: 0.5;
            }
          }

          @keyframes pulsate {
            0%, 100% {
              opacity: 0.3;
              transform: scale(0.95);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
          }
        `}</style>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ animation: 'pulsate 2s ease-in-out infinite' }}>
          <Image
            src="/st-glyph.png"
            alt="Loading"
            width={64}
            height={64}
            priority
          />
        </div>
        <style>{`
          @keyframes pulsate {
            0%, 100% {
              opacity: 0.3;
              transform: scale(0.95);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
