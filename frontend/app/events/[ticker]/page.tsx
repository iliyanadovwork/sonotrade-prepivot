'use client';

import * as stylex from "@stylexjs/stylex";
import { apiClient } from "@/lib/api/client";
import { useEffect, useState, useRef, use, useMemo } from "react";
import SingleLineChart from "@/components/SingleLineChart";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  accordionStyles,
} from "@/components/accordion";
import { ChevronDown, CheckCircle, X } from "lucide-react";
import { TradingCard } from "@/components/TradingCard";
import { FadeIn } from "@/components/FadeIn";
import Image from "next/image";
import { useOrderbookWebSocket } from "@/hooks/useOrderbookWebSocket";
import { useAuth } from "@/lib/context/AuthContext";
import { CommentSection } from "@/components/comments";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const styles = stylex.create({
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#000000",
  },
  mainContent: {
    flex: 1,
    padding: "0rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "1250px",
    display: "flex",
    gap: "2rem",
    paddingLeft: "1.25rem",
    paddingRight: "1.25rem",
    boxSizing: "border-box",
    "@media (max-width: 768px)": {
      flexDirection: "column",
      paddingLeft: "1rem",
      paddingRight: "1rem",
    },
  },
  leftColumn: {
    flex: "3",
    minWidth: 0,
    width: "100%",
    "@media (max-width: 768px)": {
      paddingBottom: "0",
      marginBottom: "0",
    },
  },
  rightColumn: {
    flex: "1",
    minWidth: "320px",
    maxWidth: "400px",
    "@media (max-width: 768px)": {
      display: "none",
    },
  },
  eventHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    marginTop: "1rem",
    marginBottom: "1rem",
    "@media (max-width: 768px)": {
      gap: "1rem",
      paddingLeft:'0rem',
      paddingRight:'0rem',
      marginTop:"0rem"
    },
  },
  eventInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  eventImage: {
    width: "60px",
    height: "60px",
    borderRadius: "0.5rem",
    objectFit: "cover",
    backgroundColor: "#262626",
  },
  eventImagePlaceholder: {
    width: "60px",
    height: "60px",
    borderRadius: "0.5rem",
    backgroundColor: "#262626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#60a5fa",
  },
  eventTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#fafafa",
    margin: 0,
    lineHeight: 1.3,
    fontFamily: "var(--font-geist-sans)",
    "@media (min-width: 768px)": {
      fontSize: "1.625rem",
    },
  },
  eventMeta: {
    fontSize: "14px",
    color: "#a3a3a3",
    margin: 0,
    fontFamily: "var(--font-geist-sans)",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    "@media (min-width: 768px)": {
      fontSize: "0.9375rem",
    },
  },
  volumeDot: {
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "#a3a3a3",
  },
  chartContainer: {
    marginTop: "0.5rem",
    padding: "0",
    width: "100%",
    maxWidth: "100%",
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
  finalizedMobileLayout: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    "@media (min-width: 768px)": {
      display: "none",
    },
  },
  finalizedMobileLeft: {
    display: "flex",
    alignItems: "center",
    paddingRight: "0",
    gap: "0.75rem",
  },
  finalizedMarketImage: {
    width: "48px",
    height: "48px",
    borderRadius: "0.375rem",
    objectFit: "cover",
    flexShrink: "0",
  },
  finalizedTextColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    height: "100%",
    gap: "0.25rem",
  },
  finalizedTitleText: {
    fontSize: "14px",
    "@media (min-width: 640px)": {
      fontSize: "0.875rem",
    },
    textAlign: "left",
    color: "white",
  },
  finalizedVolumeText: {
    fontSize: "12px",
    "@media (min-width: 640px)": {
      fontSize: "0.8125rem",
    },
    color: "#7a7a7a",
    textAlign: "left",
  },
  finalizedMobileRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flexShrink: "0",
  },
  finalizedDesktopLayout: {
    display: "none",
    "@media (min-width: 768px)": {
      display: "flex",
    },
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  finalizedDesktopLeft: {
    display: "flex",
    alignItems: "center",
    paddingRight: "1rem",
    "@media (min-width: 640px)": {
      paddingRight: "1.5rem",
    },
    minWidth: "480px",
    gap: "0.75rem",
  },
  finalizedResultBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.375rem",
    paddingLeft: "0.75rem",
    paddingRight: "0.75rem",
    paddingTop: "0.375rem",
    paddingBottom: "0.375rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    borderWidth: "1px",
    borderStyle: "solid",
    minWidth: "70px",
  },
  finalizedResultYes: {
    backgroundColor: "black",
    color: "#22DAFF",
    borderColor: "#22DAFF",
  },
  finalizedResultNo: {
    backgroundColor: "black",
    color: "#CD0768",
    borderColor: "#CD0768",
  },
});

interface DflowEvent {
  ticker: string;
  title: string;
  imageUrl: string;
  closeTime?: string;
  markets?: any[];
  [key: string]: any;
}

export default function EventPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);

  // Safely extract a yesMint from a market's accounts field which can be
  // null/undefined, an object (map of accounts) or an array. This avoids
  // runtime errors from calling Object.values on unexpected values.
  const getYesMintFromMarket = (market: any): string | null => {
    const accounts = market?.accounts;
    if (!accounts) return null;

    // If it's an array, return first element's yesMint
    if (Array.isArray(accounts)) {
      return accounts[0]?.yesMint ?? null;
    }

    // If it's an object/map, iterate values and return the first yesMint we find
    if (typeof accounts === 'object') {
      for (const val of Object.values(accounts as Record<string, any>)) {
        // Narrow to object and check property existence using a type-safe guard
        if (val && typeof val === 'object' && 'yesMint' in val) {
          const candidate = (val as any).yesMint;
          if (candidate || candidate === '') return candidate;
        }
      }
    }

    return null;
  };

  const [event, setEvent] = useState<DflowEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [orderbooks, setOrderbooks] = useState<Record<string, any>>({});
  const [orderbooksLoading, setOrderbooksLoading] = useState(false);
  const [selectedOrderBookData, setSelectedOrderBookData] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  // Whether the "More markets" trigger is currently open
  const [moreOpen, setMoreOpen] = useState(false);
  // Number of extra markets to show (increments by 5)
  const [extraMarketsToShow, setExtraMarketsToShow] = useState(5);
  // Controlled accordion values: allow 'more-markets' plus one 'market-...' value
  const [accordionValues, setAccordionValues] = useState<string[]>([]);
  // Dropdown state for market rules
  const [selectedMarketForRules, setSelectedMarketForRules] = useState<string | null>(null);
  const [isRulesDropdownOpen, setIsRulesDropdownOpen] = useState(false);
  // Track selected market for trading card
  const [selectedMarketForTrading, setSelectedMarketForTrading] = useState<any>(null);
  // Track selected outcome (yes/no) for trading card sync
  const [selectedOutcomeForTrading, setSelectedOutcomeForTrading] = useState<'yes' | 'no' | null>(null);
  // Track selected market's image for trading card
  const [selectedMarketImage, setSelectedMarketImage] = useState<string | null>(null);
  // Kalshi metadata for enhanced images
  const [kalshiMetadata, setKalshiMetadata] = useState<any>(null);
  // Saved event from MongoDB (contains imageUrl we set in admin panel)
  const [savedEvent, setSavedEvent] = useState<any>(null);
  // Related events (people are also buying)
  const [relatedEvents, setRelatedEvents] = useState<any[]>([]);
  const [relatedEventsLoading, setRelatedEventsLoading] = useState(false);
  // Tab selection for Comments and Recent Activity
  const [selectedTab, setSelectedTab] = useState<'comments' | 'activity'>('comments');
  const [commentsTotal, setCommentsTotal] = useState(0);
  // Recent trades
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [tradesLoading, setTradesLoading] = useState(false);
  // Last trade prices for each market (to set odds in accordion)
  const [lastTradePrices, setLastTradePrices] = useState<Record<string, number>>({});
  // Order type for trading (buy/sell) - shared between trading card and accordion
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  // Track currently open market ticker for WebSocket subscription
  const [openMarketTicker, setOpenMarketTicker] = useState<string | null>(null);
  // Drawer state for mobile trading card
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>('Yes');

  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleFontSize, setTitleFontSize] = useState<number | null>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const LINE_HEIGHT = 1.3;
    const MAX_FONT = 20;
    const MIN_FONT = 10;

    const measure = () => {
      if (window.innerWidth > 640) {
        setTitleFontSize(null);
        return;
      }

      let size = MAX_FONT;
      while (size > MIN_FONT) {
        el.style.fontSize = `${size}px`;
        el.style.lineHeight = `${size * LINE_HEIGHT}px`;
        if (el.scrollHeight <= size * LINE_HEIGHT * 2 + 1) break;
        size -= 0.5;
      }
      if (size <= MIN_FONT) size = MIN_FONT;

      el.style.fontSize = '';
      el.style.lineHeight = '';
      setTitleFontSize(size);
    };

    const run = () => {
      document.fonts.ready.then(measure);
    };

    run();
    window.addEventListener('resize', run);
    return () => window.removeEventListener('resize', run);
  }, [event?.title]);

  // Auth context
  const authContext = useAuth();
  const isAuthenticated = authContext.isAuthenticated;

  // Close trading card drawer when auth modal opens
  useEffect(() => {
    if (authContext.showAuthModal && isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  }, [authContext.showAuthModal, isDrawerOpen]);
  const wallet = authContext.wallet;

  const handleImageError = () => {
    setImageError(true);
  };

  // WebSocket hook for real-time orderbook updates
  // Only enable when a market is actually open
  const { isConnected: wsConnected, error: wsError, subscribe, unsubscribe } = useOrderbookWebSocket({
    enabled: openMarketTicker !== null,
    onOrderbookUpdate: (data) => {
      // Update orderbook state with real-time data
      setOrderbooks(prev => ({
        ...prev,
        [data.market_ticker]: {
          yes_bids: data.yes_bids,
          no_bids: data.no_bids,
        }
      }));
    }
  });

  // Manage WebSocket subscriptions based on open accordion
  useEffect(() => {
    if (openMarketTicker && wsConnected) {
      subscribe(openMarketTicker);
    }

    // Cleanup function to unsubscribe when accordion closes
    return () => {
      if (openMarketTicker && wsConnected) {
        unsubscribe(openMarketTicker);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openMarketTicker, wsConnected]); // Only re-run when ticker or connection status changes

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch saved event from MongoDB first (for custom imageUrl)
        try {
          const savedEventResult = await apiClient.checkEventExists(ticker);
          if (savedEventResult.success && savedEventResult.event) {
            setSavedEvent(savedEventResult.event);
          }
        } catch (savedEventError) {
          console.error('⚠️ Failed to fetch saved event from MongoDB:', savedEventError);
          // Continue without saved event - not critical
        }

        const result = await apiClient.getMarketEvent(ticker, true);

        if (result.data) {
          setEvent(result.data);

          // Fetch Kalshi metadata for enhanced images
          try {
            const metadataResult = await apiClient.getEventMetadata(ticker);
            if (metadataResult.success && metadataResult.data) {
              setKalshiMetadata(metadataResult.data);
            }
          } catch (metadataError) {
            console.warn('Failed to fetch Kalshi metadata:', metadataError);
            // Continue without metadata - not critical
          }
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Unable to load event');
        console.error("Failed to fetch event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [ticker]);

  // Fetch last trade price for each market to set odds
  useEffect(() => {
    const fetchLastTradePrices = async () => {
      if (!event?.markets || event.markets.length === 0) return;

      try {
        // Fetch last trade (limit=1) for each market
        const tradePromises = event.markets.map((market: any) =>
          apiClient.getTrades({
            ticker: market.ticker,
            limit: 1,
          }).catch(err => {
            console.error(`Failed to fetch last trade for ${market.ticker}:`, err);
            return { success: false, trades: { trades: [] } };
          })
        );

        const results = await Promise.all(tradePromises);
        
        // Build a map of ticker -> last trade price
        const pricesMap: Record<string, number> = {};
        results.forEach((result, index) => {
          const market = event.markets![index];
          if (result.success && 
              result.trades && 
              typeof result.trades === 'object' && 
              !Array.isArray(result.trades) && 
              'trades' in result.trades &&
              Array.isArray((result.trades as any).trades) &&
              (result.trades as any).trades.length > 0) {
            const lastTrade = (result.trades as any).trades[0];
            // Store the price (already in cents as a whole number like 63)
            pricesMap[market.ticker] = lastTrade.price;
          }
        });

        setLastTradePrices(pricesMap);
      } catch (err) {
        console.error('Failed to fetch last trade prices:', err);
      }
    };

    fetchLastTradePrices();
  }, [event?.markets]);

  // Fetch related events (people are also buying)
  useEffect(() => {
    const fetchRelatedEvents = async () => {
      if (!event?.seriesTicker) return;

      try {
        setRelatedEventsLoading(true);
        const result = await apiClient.getMarketEvents({
          seriesTickers: event.seriesTicker,
          status: 'active',
          withNestedMarkets: false,
          limit: 3,
        });

        if (result.success && result.events) {
          // Filter out the current event
          const filtered = result.events.filter((e: any) => e.ticker !== event.ticker);
          setRelatedEvents(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch related events:', err);
      } finally {
        setRelatedEventsLoading(false);
      }
    };

    fetchRelatedEvents();
  }, [event?.seriesTicker, event?.ticker]);

  // Fetch recent trades when activity tab is selected
  useEffect(() => {
    const fetchRecentTrades = async () => {
      if (selectedTab !== 'activity' || !event?.markets || event.markets.length === 0) return;

      try {
        setTradesLoading(true);
        
        // Fetch trades for each market (max 10 per market)
        const tradePromises = event.markets.map((market: any) =>
          apiClient.getTrades({
            ticker: market.ticker,
            limit: 10,
          }).catch(err => {
            console.error(`Failed to fetch trades for ${market.ticker}:`, err);
            return { success: false, trades: { trades: [] } };
          })
        );

        const results = await Promise.all(tradePromises);
        
        // Combine all trades and sort by timestamp (most recent first)
        const allTrades = results
          .filter(result => {
            // Filter successful results with nested trades structure
            return result.success && 
                   result.trades && 
                   typeof result.trades === 'object' && 
                   !Array.isArray(result.trades) && 
                   'trades' in result.trades &&
                   Array.isArray((result.trades as any).trades);
          })
          .flatMap(result => (result.trades as any).trades as any[])
          .sort((a, b) => (b.createdTime || 0) - (a.createdTime || 0))
          .slice(0, 20); // Take latest 20 trades

        setRecentTrades(allTrades);
      } catch (err) {
        console.error('Failed to fetch recent trades:', err);
      } finally {
        setTradesLoading(false);
      }
    };

    fetchRecentTrades();
  }, [selectedTab, event?.markets]);

  // Lazy-fetch orderbooks on demand. Also sort markets by last traded price (descending)
  const [orderbookLoadingMap, setOrderbookLoadingMap] = useState<Record<string, boolean>>({});

  const sortedMarkets = useMemo(() => {
    const markets = event?.markets || [];

    // Separate active markets from finalized/closed markets
    const activeMarkets = markets.filter((m: any) => m.status === 'active');
    const finalizedMarkets = markets.filter((m: any) => m.status === 'finalized' || m.status === 'closed');

    // Sort only active markets by last trade price (descending)
    const sortedActive = activeMarkets.slice().sort((a: any, b: any) => {
      // Markets with last trade prices should be ranked higher than those without
      const aHasLastTrade = lastTradePrices[a.ticker] !== undefined;
      const bHasLastTrade = lastTradePrices[b.ticker] !== undefined;

      // If only one has a last trade price, prioritize that one
      if (aHasLastTrade && !bHasLastTrade) return -1;
      if (!aHasLastTrade && bHasLastTrade) return 1;

      // If both have or both don't have last trade prices, sort by price
      const aVal = lastTradePrices[a.ticker] ?? ((Number.parseFloat(a?.yesAsk ?? a?.yes_ask ?? '0') * 100) || 0);
      const bVal = lastTradePrices[b.ticker] ?? ((Number.parseFloat(b?.yesAsk ?? b?.yes_ask ?? '0') * 100) || 0);
      return bVal - aVal; // descending, highest price first
    });

    // Return active markets first, then finalized/closed markets
    return [...sortedActive, ...finalizedMarkets];
  }, [event?.markets, lastTradePrices]);

  // Track which markets should have chart data loaded
  const [loadedChartMarkets, setLoadedChartMarkets] = useState<Set<string>>(new Set());

  // Initially visible markets in chart - top 4 by default
  const initiallyVisibleMarkets = useMemo(() => {
    return sortedMarkets.slice(0, 4).map((m: any) => m.ticker);
  }, [sortedMarkets]);

  // Callback to handle when a market is toggled on in the chart
  const handleChartMarketToggle = (ticker: string, isVisible: boolean) => {
    if (isVisible) {
      // Market was turned on - add it to loaded markets
      setLoadedChartMarkets(prev => new Set([...prev, ticker]));
    }
  };

  // Initialize selectedMarketForRules with the first market (highest last traded price) when data loads
  useEffect(() => {
    if (sortedMarkets.length > 0 && !selectedMarketForRules) {
      setSelectedMarketForRules(sortedMarkets[0].ticker);
    }
    if (sortedMarkets.length > 0 && !selectedMarketForTrading) {
      setSelectedMarketForTrading(sortedMarkets[0]);
    }
  }, [sortedMarkets.length, selectedMarketForRules, selectedMarketForTrading]);

  // Separate effect to update image when kalshiMetadata loads
  useEffect(() => {
    if (selectedMarketForTrading) {
      const marketImageRaw = kalshiMetadata?.market_details?.find(
        (detail: any) => detail.market_ticker === selectedMarketForTrading.ticker
      )?.image_url;
      // Only use market image if it's valid (not empty, not containing "fallback")
      const marketImage = marketImageRaw && marketImageRaw.trim() !== '' && !marketImageRaw.includes('fallback') ? marketImageRaw : null;
      // Use market image if valid, otherwise use saved MongoDB imageUrl (no API fallback)
      const finalImage = marketImage || savedEvent?.imageUrl || null;
      setSelectedMarketImage(finalImage);
    }
  }, [kalshiMetadata, selectedMarketForTrading?.ticker, savedEvent?.imageUrl]);

  const fetchOrderbookForTicker = async (marketTicker: string) => {
    // already fetched or loading?
    if (orderbooks[marketTicker] !== undefined || orderbookLoadingMap[marketTicker]) return;

    const market = (event?.markets || []).find((m: any) => m.ticker === marketTicker);
    if (!market) return;

    const yesMint = getYesMintFromMarket(market);
    if (!yesMint) {
      setOrderbooks(prev => ({ ...prev, [marketTicker]: null }));
      return;
    }

    setOrderbookLoadingMap(prev => ({ ...prev, [marketTicker]: true }));
    try {
      const res = await apiClient.getOrderbook(yesMint);
      setOrderbooks(prev => ({ ...prev, [marketTicker]: res.data }));
    } catch (err) {
      console.error(`Failed to fetch orderbook for ${marketTicker}:`, err);
      setOrderbooks(prev => ({ ...prev, [marketTicker]: null }));
    } finally {
      setOrderbookLoadingMap(prev => ({ ...prev, [marketTicker]: false }));
    }

    // Also mark this market for chart data loading
    setLoadedChartMarkets(prev => new Set([...prev, marketTicker]));
  };

  // Page-level requestOpen: control accordion state from here
  const requestOpen = (id: string) => {
    if (!id) return;

    // If it's the More toggle, toggle its presence (handled by onValueChange)
    if (id === 'more-markets' || id.startsWith('more-markets')) {
      setAccordionValues((prev) => {
        const hasMore = prev.includes('more-markets');
        const next = hasMore ? prev.filter(v => v !== 'more-markets') : [...prev, 'more-markets'];
        // The onValueChange handler will handle the logic for loading more markets
        return next;
      });
      return;
    }

    // Treat id as a market ticker; map to accordion value
    const val = `market-${id}`;

    setAccordionValues((prev) => {
      const isCurrentlyOpen = prev.includes(val);

      // If clicking the same market that's already open, close it
      if (isCurrentlyOpen) {
        const next = prev.filter(v => v !== val);
        setMoreOpen(next.includes('more-markets'));
        // Clear WebSocket subscription when closing
        setOpenMarketTicker(null);
        return next;
      }

      // Otherwise, open this market and close all other markets (preserve More toggle if present)
      let next: string[] = [val];
      if (prev.includes('more-markets')) {
        next.push('more-markets');
      }
      setMoreOpen(next.includes('more-markets'));
      // Update WebSocket subscription for the newly opened market
      setOpenMarketTicker(id);
      return next;
    });

    // Trigger lazy fetch for this market
    fetchOrderbookForTicker(id);
  };

  return (
    <div {...stylex.props(styles.layout)}>
      <main {...stylex.props(styles.mainContent)}>
        {loading && (
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
            <style jsx>{`
              @keyframes pulsate {
                0%, 100% {
                  opacity: 0.3;
                  transform: scale(1);
                }
                50% {
                  opacity: 1;
                  transform: scale(1.05);
                }
              }
            `}</style>
          </div>
        )}
        {!loading && (
          <div {...stylex.props(styles.contentWrapper)}>
            {/* Left Column - Main Content */}
            <div {...stylex.props(styles.leftColumn)}>

          {error && (
            <div {...stylex.props(styles.errorBadge)}>
              Unable to load event
            </div>
          )}

          {!error && event && (
            <FadeIn>
              <div {...stylex.props(styles.eventHeader)}>
              {savedEvent?.imageUrl && !imageError ? (
                <Image
                  src={savedEvent.imageUrl}
                  alt={event.title}
                  width={80}
                  height={80}
                  priority
                  unoptimized
                  onError={handleImageError}
                  className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-lg md:rounded-[0.625rem]"
                  style={{ objectFit: 'cover', backgroundColor: '#262626' }}
                />
              ) : (
                <div {...stylex.props(styles.eventImagePlaceholder)}>
                  {event.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div {...stylex.props(styles.eventInfo)}>
                <h1
                  ref={titleRef}
                  {...stylex.props(styles.eventTitle)}
                  style={titleFontSize !== null ? { fontSize: `${titleFontSize}px`, lineHeight: `${titleFontSize * 1.3}px` } : undefined}
                >
                  {event.title}
                </h1>
              </div>
              </div>
            </FadeIn>
          )}

          {!error && event && event.markets && event.markets.length > 0 && (
            <FadeIn delay={100}>
              <div {...stylex.props(styles.chartContainer)}>
              <SingleLineChart
                interval="all"
                markets={sortedMarkets}
                eventTicker={event.ticker}
                initiallyVisibleMarkets={initiallyVisibleMarkets}
                onMarketToggle={handleChartMarketToggle}
                volume={event.volume}
                closeTime={event.markets[0]?.closeTime}
              />
              </div>
            </FadeIn>
          )}

          {!error && event && event.markets && event.markets.length > 0 && (
            <div className='mx-0 sm:mx-0' style={{ marginTop: '2rem', width: 'auto' }}>
              {orderbooksLoading && (
                <div {...stylex.props(styles.loadingContainer)}>
                  <span {...stylex.props(styles.loadingText)}>Loading orderbooks...</span>
                </div>
              )}
              {!orderbooksLoading && (
                <>
                  {/* Header above order books - only show for multi-market events */}
                  {sortedMarkets.length > 1 && (
                    <FadeIn delay={200}>
                      <div className="border-t border-b border-[#262626] min-h-[32px] pt-2 pb-2 items-center gap-2 justify-between w-full mb-0">
                      <div className="hidden md:grid items-center w-full" style={{ gridTemplateColumns: 'var(--trigger-left-width, 340px) minmax(70px,70px) 1fr' }}>
                        <div className="flex items-center sm:pr-6 pr-4" style={{ width: 'var(--trigger-left-width, 340px)' }}>
                          {/* left area: show Markets label aligned to the left of the content area */}
                          <span className="text-white text-[13px] sm:text-[14px] font-semibold">Markets</span>
                        </div>
                        <div className="flex items-center justify-end min-w-[203px] pl-1 pr-2">
                          <span className="text-white text-[13px] sm:text-[14px] leading-[20px] font-normal">Chance</span>
                        </div>
                      </div>
                      {/* Mobile: Markets on left, Chance on right */}
                      <div className="flex md:hidden items-center w-full justify-between">
                        <div className="flex items-center pl-0">
                          <span className="text-white text-[13px] font-semibold">Markets</span>
                        </div>
                        <div className="flex items-center justify-end pr-0">
                          <span className="text-white text-[13px] leading-[20px] font-normal">Chance</span>
                        </div>
                      </div>
                      </div>
                    </FadeIn>
                  )}

                  <Accordion
                    type="multiple"
                    value={accordionValues}
                    onRequestOpen={requestOpen}
                    externalSelection={selectedOutcomeForTrading}
                    onSelectionChange={(marketId, selection) => {
                      // Update the selected outcome for trading card
                      setSelectedOutcomeForTrading(selection as 'yes' | 'no' | null);
                    }}
                    onValueChange={(val) => {
                      const values = Array.isArray(val) ? val : (val ? [val] : []);

                      const hasMore = values.includes('more-markets');
                      const wasMoreOpen = accordionValues.includes('more-markets');

                      // Handle "More markets" toggle
                      if (hasMore !== wasMoreOpen && !hasMore) {
                        // User clicked to close "More markets"
                        const totalExtra = sortedMarkets.slice(4).length;

                        if (extraMarketsToShow >= totalExtra) {
                          // Was showing all markets, allow close and reset count
                          setExtraMarketsToShow(5);
                          setMoreOpen(false);
                        } else {
                          // Was showing partial, load 5 more instead of closing
                          setExtraMarketsToShow(prevCount => Math.min(prevCount + 5, totalExtra));
                          // Force it to stay open
                          values.push('more-markets');
                          setMoreOpen(true);
                        }
                      } else {
                        setMoreOpen(hasMore);
                      }

                      // Find all market values in the incoming change
                      const marketVals = values.filter((v) => typeof v === 'string' && v.startsWith('market-'));

                      // Determine which market should be open:
                      // - If there are multiple markets in the incoming values, pick the NEW one (the one not in current accordionValues)
                      // - If there's one market, use it
                      // - If there are none, check if user clicked an already-open market (keep it open)
                      let targetMarket: string | undefined;

                      if (marketVals.length > 1) {
                        // Multiple markets in the change - find the new one (not in current accordionValues)
                        targetMarket = marketVals.find(m => !accordionValues.includes(m)) || marketVals[0];
                      } else if (marketVals.length === 1) {
                        // Single market - use it
                        targetMarket = marketVals[0];
                      } else {
                        // No markets in the incoming change - user might be trying to close
                        // But we want to keep at least one open if there was one before
                        const currentMarket = accordionValues.find(v => v.startsWith('market-'));
                        if (currentMarket && !values.includes(currentMarket)) {
                          // User clicked the open market to close it - allow closing
                          targetMarket = undefined;
                        }
                      }

                      let newValues: string[] = [];

                      if (targetMarket) {
                        // Only keep a single market open at once
                        newValues.push(targetMarket);
                      }

                      if (values.includes('more-markets')) {
                        // Preserve the More toggle if it is open
                        newValues.push('more-markets');
                      }

                      setAccordionValues(newValues);
                      setMoreOpen(newValues.includes('more-markets'));

                      // Lazy-fetch the opened market's orderbook and update trading card
                      if (targetMarket) {
                        const ticker = targetMarket.replace('market-', '');
                        fetchOrderbookForTicker(ticker);
                        // Update WebSocket subscription for the opened market
                        setOpenMarketTicker(ticker);
                        // Update the trading card with the selected market
                        const market = sortedMarkets.find((m: any) => m.ticker === ticker);
                        if (market) {
                          setSelectedMarketForTrading(market);
                          // This will trigger the useEffect to update the image
                        }
                      } else {
                        // No market is open - clear WebSocket subscription
                        setOpenMarketTicker(null);
                      }
                    }}
                  >
                    {(() => {
                      const visible = sortedMarkets.slice(0, 4);
                      const extra = sortedMarkets.slice(4);
                      const extraToShow = extra.slice(0, extraMarketsToShow);

                      return (
                        <>
                          {visible.map((market, idx) => {
                            const orderbook = orderbooks[market.ticker];
                            const displayTitle = (sortedMarkets && sortedMarkets.length === 1)
                              ? 'Order Book'
                              : (market.yesSubTitle || event.yesSubTitle || `Market ${idx + 1}`);

                            // Find matching image from Kalshi metadata
                            const marketImageRaw = kalshiMetadata?.market_details?.find(
                              (detail: any) => detail.market_ticker === market.ticker
                            )?.image_url;
                            // Only use market image if it's valid (not empty, not containing "fallback")
                            const marketImage = (marketImageRaw && marketImageRaw.trim() !== '' && !marketImageRaw.includes('fallback'))
                              ? marketImageRaw
                              : undefined;

                            // Calculate index once
                            const marketIndex = idx;

                            // Check if market is finalized or closed
                            const isFinalized = market.status === 'finalized';
                            const isClosed = market.status === 'closed';

                            if (isFinalized) {
                              // Render non-expandable result display
                              return (
                                <FadeIn key={market.ticker} delay={250 + (marketIndex * 50)}>
                                  <div {...stylex.props(accordionStyles.finalizedMarketTrigger)} style={sortedMarkets.length === 1 ? { borderTop: '1px solid #262626' } : undefined}>
                                  {/* Mobile layout */}
                                  <div {...stylex.props(styles.finalizedMobileLayout)}>
                                    <div {...stylex.props(styles.finalizedMobileLeft)}>
                                      {marketImage && (
                                        <img
                                          src={marketImage}
                                          alt=""
                                          {...stylex.props(styles.finalizedMarketImage)}
                                        />
                                      )}
                                      <div {...stylex.props(styles.finalizedTextColumn)}>
                                        <span {...stylex.props(styles.finalizedTitleText)}>
                                          {displayTitle}
                                        </span>
                                        <span {...stylex.props(styles.finalizedVolumeText)}>
                                          Vol ${
                                            typeof market.volume === "number"
                                              ? Number(market.volume * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                              : "--"
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div {...stylex.props(styles.finalizedMobileRight)}>
                                      <div {...stylex.props(
                                        styles.finalizedResultBadge,
                                        market.result === 'yes' ? styles.finalizedResultYes : styles.finalizedResultNo
                                      )}>
                                        {market.result === 'yes' ? (
                                          <>
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Yes</span>
                                          </>
                                        ) : (
                                          <>
                                            <X className="w-4 h-4" />
                                            <span>No</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Desktop layout */}
                                  <div {...stylex.props(styles.finalizedDesktopLayout)}>
                                    <div {...stylex.props(styles.finalizedDesktopLeft)}>
                                      {marketImage && (
                                        <img
                                          src={marketImage}
                                          alt=""
                                          {...stylex.props(styles.finalizedMarketImage)}
                                        />
                                      )}
                                      <div {...stylex.props(styles.finalizedTextColumn)}>
                                        <span {...stylex.props(styles.finalizedTitleText)}>
                                          {displayTitle}
                                        </span>
                                        <span {...stylex.props(styles.finalizedVolumeText)}>
                                          Vol ${
                                            typeof market.volume === "number"
                                              ? Number(market.volume * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                              : "--"
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div {...stylex.props(
                                      styles.finalizedResultBadge,
                                      market.result === 'yes' ? styles.finalizedResultYes : styles.finalizedResultNo
                                    )}>
                                      {market.result === 'yes' ? (
                                        <>
                                          <CheckCircle className="w-4 h-4" />
                                          <span>Yes</span>
                                        </>
                                      ) : (
                                        <>
                                          <X className="w-4 h-4" />
                                          <span>No</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  </div>
                                </FadeIn>
                              );
                            }

                            if (isClosed) {
                              // Render non-expandable "Market closed" display
                              return (
                                <FadeIn key={market.ticker} delay={250 + (marketIndex * 50)}>
                                  <div {...stylex.props(accordionStyles.finalizedMarketTrigger)} style={sortedMarkets.length === 1 ? { borderTop: '1px solid #262626' } : undefined}>
                                  {/* Mobile layout */}
                                  <div {...stylex.props(styles.finalizedMobileLayout)}>
                                    <div {...stylex.props(styles.finalizedMobileLeft)}>
                                      {marketImage && (
                                        <img
                                          src={marketImage}
                                          alt=""
                                          {...stylex.props(styles.finalizedMarketImage)}
                                        />
                                      )}
                                      <div {...stylex.props(styles.finalizedTextColumn)}>
                                        <span {...stylex.props(styles.finalizedTitleText)}>
                                          {displayTitle}
                                        </span>
                                        <span {...stylex.props(styles.finalizedVolumeText)}>
                                          Vol ${
                                            typeof market.volume === "number"
                                              ? Number(market.volume * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                              : "--"
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div {...stylex.props(styles.finalizedMobileRight)}>
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(122, 122, 122, 0.1)',
                                        border: '1px solid #3a3a3a'
                                      }}>
                                        <span style={{ color: '#a3a3a3', fontSize: '13px', fontWeight: 500 }}>Market closed</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Desktop layout */}
                                  <div {...stylex.props(styles.finalizedDesktopLayout)}>
                                    <div {...stylex.props(styles.finalizedDesktopLeft)}>
                                      {marketImage && (
                                        <img
                                          src={marketImage}
                                          alt=""
                                          {...stylex.props(styles.finalizedMarketImage)}
                                        />
                                      )}
                                      <div {...stylex.props(styles.finalizedTextColumn)}>
                                        <span {...stylex.props(styles.finalizedTitleText)}>
                                          {displayTitle}
                                        </span>
                                        <span {...stylex.props(styles.finalizedVolumeText)}>
                                          Vol ${
                                            typeof market.volume === "number"
                                              ? Number(market.volume * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                              : "--"
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(122, 122, 122, 0.1)',
                                      border: '1px solid #3a3a3a'
                                    }}>
                                      <span style={{ color: '#a3a3a3', fontSize: '13px', fontWeight: 500 }}>Market closed</span>
                                    </div>
                                  </div>
                                  </div>
                                </FadeIn>
                              );
                            }

                            return (
                              <FadeIn key={market.ticker} delay={250 + (marketIndex * 50)}>
                                <AccordionItem
                                  value={`market-${market.ticker}`}
                                  style={sortedMarkets.length === 1 ? { borderTop: '1px solid #262626' } : undefined}
                                >
                                <AccordionTrigger
                                  marketId={market.ticker}
                                  outcomePrice={lastTradePrices[market.ticker]}
                                  setSelectedOrderBookData={setSelectedOrderBookData}
                                  orderBook={orderbook}
                                  setSelectedIndex={(i) => {
                                    setSelectedIndex(marketIndex);
                                    setSelectedMarketForTrading(market);
                                    setSelectedMarketImage(marketImage || savedEvent?.imageUrl || null);
                                  }}
                                  index={marketIndex}
                                  volume={market.volume}
                                  outcome0Title={market.yesSubTitle || "Yes"}
                                  outcome1Title={market.noSubTitle || "No"}
                                  marketImageUrl={marketImage}
                                  yesAsk={market.yesAsk}
                                  noAsk={market.noAsk}
                                  yesBid={market.yesBid}
                                  noBid={market.noBid}
                                  orderType={orderType}
                                  setIsDrawerOpen={setIsDrawerOpen}
                                  setActiveView={setActiveView}
                                >
                                  <span>{displayTitle}</span>
                                </AccordionTrigger>
                                <AccordionContent marketId={market.ticker} orderBook={orderbook}>
                                  {/* Content handled internally; will render when opened. */}
                                </AccordionContent>
                                </AccordionItem>
                              </FadeIn>
                            );
                          })}

                          {/* When More is open, render the extra market triggers above the More trigger so they push it down */}
                          {moreOpen && extraToShow.map((market, idx) => {
                            const extraDelay = 500 + (idx * 50);
                            const orderbook = orderbooks[market.ticker];
                            const displayTitle = market.yesSubTitle || event.yesSubTitle || `Market ${4 + idx + 1}`;

                            // Find matching image from Kalshi metadata
                            const marketImageRaw = kalshiMetadata?.market_details?.find(
                              (detail: any) => detail.market_ticker === market.ticker
                            )?.image_url;
                            // Only use market image if it's valid (not empty, not containing "fallback")
                            const marketImage = (marketImageRaw && marketImageRaw.trim() !== '' && !marketImageRaw.includes('fallback'))
                              ? marketImageRaw
                              : undefined;

                            // Calculate index once (offset by 4 since these are extra markets)
                            const marketIndex = 4 + idx;

                            // Check if market is finalized or closed
                            const isFinalized = market.status === 'finalized';
                            const isClosed = market.status === 'closed';

                            if (isFinalized) {
                              // Render non-expandable result display
                              return (
                                <FadeIn key={market.ticker} delay={250 + (marketIndex * 50)}>
                                  <div {...stylex.props(accordionStyles.finalizedMarketTrigger)} style={sortedMarkets.length === 1 ? { borderTop: '1px solid #262626' } : undefined}>
                                  {/* Mobile layout */}
                                  <div {...stylex.props(styles.finalizedMobileLayout)}>
                                    <div {...stylex.props(styles.finalizedMobileLeft)}>
                                      {marketImage && (
                                        <img
                                          src={marketImage}
                                          alt=""
                                          {...stylex.props(styles.finalizedMarketImage)}
                                        />
                                      )}
                                      <div {...stylex.props(styles.finalizedTextColumn)}>
                                        <span {...stylex.props(styles.finalizedTitleText)}>
                                          {displayTitle}
                                        </span>
                                        <span {...stylex.props(styles.finalizedVolumeText)}>
                                          Vol ${
                                            typeof market.volume === "number"
                                              ? Number(market.volume * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                              : "--"
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div {...stylex.props(styles.finalizedMobileRight)}>
                                      <div {...stylex.props(
                                        styles.finalizedResultBadge,
                                        market.result === 'yes' ? styles.finalizedResultYes : styles.finalizedResultNo
                                      )}>
                                        {market.result === 'yes' ? (
                                          <>
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Yes</span>
                                          </>
                                        ) : (
                                          <>
                                            <X className="w-4 h-4" />
                                            <span>No</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Desktop layout */}
                                  <div {...stylex.props(styles.finalizedDesktopLayout)}>
                                    <div {...stylex.props(styles.finalizedDesktopLeft)}>
                                      {marketImage && (
                                        <img
                                          src={marketImage}
                                          alt=""
                                          {...stylex.props(styles.finalizedMarketImage)}
                                        />
                                      )}
                                      <div {...stylex.props(styles.finalizedTextColumn)}>
                                        <span {...stylex.props(styles.finalizedTitleText)}>
                                          {displayTitle}
                                        </span>
                                        <span {...stylex.props(styles.finalizedVolumeText)}>
                                          Vol ${
                                            typeof market.volume === "number"
                                              ? Number(market.volume * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                              : "--"
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div {...stylex.props(
                                      styles.finalizedResultBadge,
                                      market.result === 'yes' ? styles.finalizedResultYes : styles.finalizedResultNo
                                    )}>
                                      {market.result === 'yes' ? (
                                        <>
                                          <CheckCircle className="w-4 h-4" />
                                          <span>Yes</span>
                                        </>
                                      ) : (
                                        <>
                                          <X className="w-4 h-4" />
                                          <span>No</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  </div>
                                </FadeIn>
                              );
                            }

                            if (isClosed) {
                              // Render non-expandable "Market closed" display
                              return (
                                <FadeIn key={market.ticker} delay={250 + (marketIndex * 50)}>
                                  <div {...stylex.props(accordionStyles.finalizedMarketTrigger)} style={sortedMarkets.length === 1 ? { borderTop: '1px solid #262626' } : undefined}>
                                  {/* Mobile layout */}
                                  <div {...stylex.props(styles.finalizedMobileLayout)}>
                                    <div {...stylex.props(styles.finalizedMobileLeft)}>
                                      {marketImage && (
                                        <img
                                          src={marketImage}
                                          alt=""
                                          {...stylex.props(styles.finalizedMarketImage)}
                                        />
                                      )}
                                      <div {...stylex.props(styles.finalizedTextColumn)}>
                                        <span {...stylex.props(styles.finalizedTitleText)}>
                                          {displayTitle}
                                        </span>
                                        <span {...stylex.props(styles.finalizedVolumeText)}>
                                          Vol ${
                                            typeof market.volume === "number"
                                              ? Number(market.volume * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                              : "--"
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div {...stylex.props(styles.finalizedMobileRight)}>
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(122, 122, 122, 0.1)',
                                        border: '1px solid #3a3a3a'
                                      }}>
                                        <span style={{ color: '#a3a3a3', fontSize: '13px', fontWeight: 500 }}>Market closed</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Desktop layout */}
                                  <div {...stylex.props(styles.finalizedDesktopLayout)}>
                                    <div {...stylex.props(styles.finalizedDesktopLeft)}>
                                      {marketImage && (
                                        <img
                                          src={marketImage}
                                          alt=""
                                          {...stylex.props(styles.finalizedMarketImage)}
                                        />
                                      )}
                                      <div {...stylex.props(styles.finalizedTextColumn)}>
                                        <span {...stylex.props(styles.finalizedTitleText)}>
                                          {displayTitle}
                                        </span>
                                        <span {...stylex.props(styles.finalizedVolumeText)}>
                                          Vol ${
                                            typeof market.volume === "number"
                                              ? Number(market.volume * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                              : "--"
                                          }
                                        </span>
                                      </div>
                                    </div>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(122, 122, 122, 0.1)',
                                      border: '1px solid #3a3a3a'
                                    }}>
                                      <span style={{ color: '#a3a3a3', fontSize: '13px', fontWeight: 500 }}>Market closed</span>
                                    </div>
                                  </div>
                                  </div>
                                </FadeIn>
                              );
                            }

                            return (
                              <FadeIn key={market.ticker} delay={250 + (marketIndex * 50)}>
                                <AccordionItem
                                  value={`market-${market.ticker}`}
                                  style={sortedMarkets.length === 1 ? { borderTop: '1px solid #262626' } : undefined}
                                >
                                <AccordionTrigger
                                  marketId={market.ticker}
                                  outcomePrice={lastTradePrices[market.ticker]}
                                  setSelectedOrderBookData={setSelectedOrderBookData}
                                  orderBook={orderbook}
                                  setSelectedIndex={(i) => {
                                    setSelectedIndex(marketIndex);
                                    setSelectedMarketForTrading(market);
                                    setSelectedMarketImage(marketImage || savedEvent?.imageUrl || null);
                                  }}
                                  index={marketIndex}
                                  volume={market.volume}
                                  outcome0Title={market.yesSubTitle || "Yes"}
                                  outcome1Title={market.noSubTitle || "No"}
                                  marketImageUrl={marketImage}
                                  yesAsk={market.yesAsk}
                                  noAsk={market.noAsk}
                                  yesBid={market.yesBid}
                                  noBid={market.noBid}
                                  orderType={orderType}
                                  setIsDrawerOpen={setIsDrawerOpen}
                                  setActiveView={setActiveView}
                                >
                                  <span>{displayTitle}</span>
                                </AccordionTrigger>
                                <AccordionContent marketId={market.ticker} orderBook={orderbook}>
                                  {/* lazy fetched when opened */}
                                </AccordionContent>
                                </AccordionItem>
                              </FadeIn>
                            );
                          })}

                          {/* Render the More markets trigger at the bottom */}
                          {extra.length > 0 && (
                            <FadeIn delay={450}>
                              <AccordionItem key="more-markets" value={`more-markets`}>
                              <AccordionTrigger
                                marketId={`more-markets`}
                                setSelectedOrderBookData={() => {}}
                                orderBook={null}
                                setSelectedIndex={() => {}}
                                index={-1}
                                volume={0}
                                onDecreaseMoreMarkets={() => {
                                  // Decrease by 5
                                  const newCount = extraMarketsToShow - 5;
                                  if (newCount <= 0) {
                                    // Close accordion and reset
                                    setExtraMarketsToShow(5);
                                    setAccordionValues(prev => prev.filter(v => v !== 'more-markets'));
                                    setMoreOpen(false);
                                  } else {
                                    setExtraMarketsToShow(newCount);
                                  }
                                }}
                              >
                                {[
                                  'More markets',
                                  'Show less',
                                  extraMarketsToShow >= extra.length, // hasAllShown
                                ]}
                              </AccordionTrigger>
                              <AccordionContent marketId={`more-markets`} orderBook={null}>
                                {/* empty content; extra items are rendered above when moreOpen is true */}
                              </AccordionContent>
                              </AccordionItem>
                            </FadeIn>
                          )}
                        </>
                      );
                    })()}
                  </Accordion>

                  {/* Market Rules Dropdown */}
                  {sortedMarkets.length > 0 && (
                    <FadeIn>
                      <div className="mt-6 flex flex-col gap-2">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-0" style={{ height: '32px' }}>
                        <h2 className="text-white text-2xl font-semibold leading-8 tracking-tight m-0">
                          Market rules
                        </h2>
                      </div>

                      {/* Dropdown Trigger - only show for multi-market events */}
                      {sortedMarkets.length > 1 && (
                        <div className="relative">
                          <button
                            onClick={() => setIsRulesDropdownOpen(!isRulesDropdownOpen)}
                            className="flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 text-left hover:opacity-80 transition-opacity"
                          >
                            <span className="text-white text-[15px] font-medium leading-6">
                              {sortedMarkets.find((m: any) => m.ticker === selectedMarketForRules)?.yesSubTitle || 'Select Market'}
                            </span>
                            <ChevronDown
                              className={`h-6 w-6 text-white transition-transform duration-200 ${isRulesDropdownOpen ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {/* Popup Dropdown Menu */}
                          {isRulesDropdownOpen && (
                            <>
                              {/* Backdrop to close dropdown when clicking outside */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsRulesDropdownOpen(false)}
                              />

                              {/* Dropdown content */}
                              <div 
                                className="absolute z-20 w-full mt-1 bg-[#000000] border border-[#262626] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                style={{
                                  animation: 'dropdown-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                                  transformOrigin: 'top left'
                                }}
                              >
                                {sortedMarkets.map((market: any) => (
                                  <button
                                    key={market.ticker}
                                    onClick={() => {
                                      setSelectedMarketForRules(market.ticker);
                                      setIsRulesDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-[15px] transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                      selectedMarketForRules === market.ticker
                                        ? 'bg-[#1a1a1a] text-white font-medium'
                                        : 'text-[#a3a3a3] hover:bg-[#101010] hover:text-white'
                                    }`}
                                  >
                                    {market.yesSubTitle || market.ticker}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Rules Content */}
                      <div className="flex flex-col gap-2 relative mt-2">
                        <p className="sm:text-[15px] text-[14px] text-white/70 leading-6">
                          {sortedMarkets.find((m: any) => m.ticker === selectedMarketForRules)?.rulesPrimary ||
                           'No rules available for this market.'}
                          {/* Settlement Sources */}
                          {event?.settlementSources && event.settlementSources.length > 0 && (
                            <span>
                              {' Settlement sources: '}
                              {event.settlementSources.map((source: any, idx: number) => (
                                <span key={idx}>
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-white transition-colors"
                                  >
                                    {source.name}
                                  </a>
                                  {idx < event.settlementSources.length - 1 ? ', ' : '.'}
                                </span>
                              ))}
                            </span>
                          )}
                        </p>

                        {/* Market Timeline */}
                        <div className="flex flex-col p-0.5 mt-4">
                          {(() => {
                            const now = Date.now();
                            // Use the selected market's close time
                            const selectedMarket = sortedMarkets.find((m: any) => m.ticker === selectedMarketForRules);
                            const closeTime = selectedMarket?.closeTime ? selectedMarket.closeTime * 1000 : null;
                            // Projected payout is always 48 hours after market close
                            const projectedPayoutTime = closeTime ? closeTime + (48 * 60 * 60 * 1000) : null;

                            const isMarketClosed = closeTime ? now > closeTime : false;
                            const isPayoutComplete = projectedPayoutTime ? now > projectedPayoutTime : false;

                            return (
                              <>
                                {/* Market Open */}
                                <div className="flex gap-2">
                                  <div className="flex flex-col items-center h-full">
                                    <div className="flex items-center justify-center w-[20px] h-[20px] pt-[2px]">
                                      <CheckCircle
                                        className="w-6 h-6 text-[#00e676]"
                                        fill="#000000"
                                      />
                                    </div>
                                    <div className={`flex w-[2px] h-[50px] ${isMarketClosed ? 'bg-[#00e676]' : 'bg-[#3a3a3a]'}`}></div>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-white sm:text-[15px] text-[14px] leading-6 font-normal">
                                      Market open
                                    </span>
                                    <span className="text-[#7a7a7a] sm:text-[13px] text-[12px] leading-5 font-normal">
                                      {event?.markets?.[0]?.openTime
                                        ? new Date(event.markets[0].openTime * 1000).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            timeZoneName: 'short'
                                          })
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </div>

                                {/* Market Closes */}
                                <div className="flex gap-2">
                                  <div className="flex flex-col items-center h-full">
                                    <div className="flex items-center justify-center w-[20px] h-[20px] pt-[2px]">
                                      {isMarketClosed ? (
                                        <CheckCircle
                                          className="w-6 h-6 text-[#00e676]"
                                          fill="#000000"
                                        />
                                      ) : (
                                        <div className="rounded-full w-[10px] h-[10px] bg-[#3a3a3a]"></div>
                                      )}
                                    </div>
                                    <div className={`flex w-[2px] h-[50px] ${isPayoutComplete ? 'bg-[#00e676]' : 'bg-[#3a3a3a]'}`}></div>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-white sm:text-[15px] text-[14px] leading-6 font-normal">
                                      {isMarketClosed ? 'Market closed' : 'Market closes'}
                                    </span>
                                    <span className="text-[#7a7a7a] sm:text-[13px] text-[12px] leading-5 font-normal">
                                      {closeTime
                                        ? new Date(closeTime).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            timeZoneName: 'short'
                                          })
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </div>

                                {/* Projected Payout */}
                                <div className="flex gap-2">
                                  <div className="flex flex-col items-center h-full">
                                    <div className="flex items-center justify-center w-[20px] h-[20px] pt-[2px]">
                                      {isPayoutComplete ? (
                                        <CheckCircle
                                          className="w-6 h-6 text-[#00e676]"
                                          fill="#000000"
                                        />
                                      ) : (
                                        <div className="rounded-full w-[10px] h-[10px] bg-[#3a3a3a]"></div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-white sm:text-[15px] text-[14px] leading-6 font-normal">
                                      {isPayoutComplete ? 'Payout' : 'Projected payout'}
                                    </span>
                                    <span className="text-[#7a7a7a] sm:text-[13px] text-[12px] leading-5 font-normal">
                                      {projectedPayoutTime
                                        ? new Date(projectedPayoutTime).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            timeZoneName: 'short'
                                          })
                                        : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      </div>
                    </FadeIn>
                  )}

                  {/* People are also buying section */}
                      {relatedEvents.length > 0 && (
                        <FadeIn>
                          <div className="mt-6 flex flex-col gap-2">
                          <div className="flex items-center justify-between mb-2" style={{ height: '40px' }}>
                            <h2 className="text-white text-2xl font-semibold leading-8 tracking-tight m-0">
                              Similar markets
                            </h2>
                          </div>
                          <div className="flex flex-wrap overflow-hidden transition-all ease-in-out duration-[300ms] -ml-1.5">
                            {relatedEvents.map((relatedEvent: any) => (
                              <a
                                key={relatedEvent.ticker}
                                className="flex items-center gap-2 p-1.5 rounded-lg w-full hover:bg-[#101010] sm:w-[calc(100%+24px)] sm:!-mr-1.5 transition-colors mb-3"
                                href={`/events/${relatedEvent.ticker}`}
                              >
                                <div className="flex justify-center items-center w-12 min-w-[48px] h-12 rounded-md bg-transparent">
                                  {relatedEvent.imageUrl ? (
                                    <img
                                      alt={relatedEvent.title}
                                      loading="lazy"
                                      width="48"
                                      height="48"
                                      className="w-12 h-12 object-cover"
                                      src={relatedEvent.imageUrl}
                                      style={{ borderRadius: '0.375rem' }}
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-md bg-[#262626]"></div>
                                  )}
                                </div>
                                <span className="text-white pl-2 text-[15px] leading-6 font-medium">
                                  {relatedEvent.title}
                                </span>
                              </a>
                            ))}
                          </div>
                          </div>
                        </FadeIn>
                      )}

                      {/* Comments and Recent Activity Tabs */}
                      <FadeIn>
                        <div className="mt-12 flex flex-col gap-4">
                        {/* Tab Headers */}
                        <div className="flex gap-6 border-b border-[#262626]">
                          <button
                            onClick={() => setSelectedTab('comments')}
                            className={`pb-3 px-1 text-[15px] font-medium transition-colors border-b-2 cursor-pointer ${
                              selectedTab === 'comments'
                                ? 'text-white border-white'
                                : 'text-[#7a7a7a] border-transparent hover:text-[#a3a3a3]'
                            }`}
                          >
                            Comments {commentsTotal > 0 && `(${commentsTotal})`}
                          </button>
                          <button
                            onClick={() => setSelectedTab('activity')}
                            className={`pb-3 px-1 text-[15px] font-medium transition-colors border-b-2 cursor-pointer ${
                              selectedTab === 'activity'
                                ? 'text-white border-white'
                                : 'text-[#7a7a7a] border-transparent hover:text-[#a3a3a3]'
                            }`}
                          >
                            Recent Trades
                          </button>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[200px]">
                          {selectedTab === 'comments' && event && (
                            <CommentSection
                              eventId={event.ticker}
                              onTotalChange={setCommentsTotal}
                              marketTitle={event.title}
                              marketImage={savedEvent?.imageUrl || undefined}
                            />
                          )}

                          {selectedTab === 'activity' && (
                            <div className="flex flex-col">
                              {tradesLoading ? (
                                <div className="flex items-center justify-center py-12">
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
                                  <style jsx>{`
                                    @keyframes pulsate {
                                      0%, 100% {
                                        opacity: 0.3;
                                        transform: scale(1);
                                      }
                                      50% {
                                        opacity: 1;
                                        transform: scale(1.05);
                                      }
                                    }
                                  `}</style>
                                </div>
                              ) : recentTrades.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                  <p className="text-[#7a7a7a] text-[15px]">
                                    No recent trades to display.
                                  </p>
                                </div>
                              ) : (
                                <div className="flex flex-col">
                                  {recentTrades.map((trade, idx) => {
                                    // Find the market for this trade
                                    const tradeMarket = sortedMarkets.find((m: any) => m.ticker === trade.ticker);
                                    
                                    // Get market image from Kalshi metadata
                                    const marketImageRaw = kalshiMetadata?.market_details?.find(
                                      (detail: any) => detail.market_ticker === trade.ticker
                                    )?.image_url;
                                    // Only use market image if it's valid (not empty, not containing "fallback")
                                    const marketImage = (marketImageRaw && marketImageRaw.trim() !== '' && !marketImageRaw.includes('fallback'))
                                      ? marketImageRaw
                                      : null;
                                    
                                    // Determine trade action text
                                    const takerSide = trade.takerSide?.toLowerCase();
                                    const actionText = takerSide === 'yes' ? 'Traded Yes' : 'Traded No';
                                    const actionColor = takerSide === 'yes' 
                                      ? '#22DAFF' // yes cyan (matches accordion button)
                                      : '#CD0768'; // no pink (matches accordion button)
                                    
                                    // Calculate price in cents based on takerSide
                                    const priceInCents = takerSide === 'yes' 
                                      ? Math.round(trade.yesPrice / 100) 
                                      : Math.round(trade.noPrice / 100);
                                    
                                    // Calculate time ago
                                    const getTimeAgo = (timestamp: number) => {
                                      const seconds = Math.floor(Date.now() / 1000 - timestamp);
                                      if (seconds < 60) return 'Now';
                                      const minutes = Math.floor(seconds / 60);
                                      if (minutes < 60) return `${minutes}m`;
                                      const hours = Math.floor(minutes / 60);
                                      if (hours < 24) return `${hours}h`;
                                      const days = Math.floor(hours / 24);
                                      return `${days}d`;
                                    };

                                    return (
                                      <FadeIn key={`${trade.tradeId || idx}-${trade.createdTime}`} delay={idx * 50}>
                                        <div>
                                          {idx > 0 && (
                                            <hr className="border-none flex-shrink-0 self-stretch" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', height: '1px', margin: 0 }} />
                                          )}
                                          <div className="flex items-center gap-4 py-3">
                                          {/* Market Image */}
                                          {marketImage && (
                                            <div style={{ background: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '48px', minWidth: '48px', height: '48px', borderRadius: '8px' }}>
                                              <img
                                                alt={tradeMarket?.yesSubTitle || trade.ticker}
                                                loading="lazy"
                                                width="48"
                                                height="48"
                                                className="w-12 h-12 object-cover"
                                                src={marketImage}
                                                style={{ borderRadius: '0.375rem', width: '48px', height: '48px', objectFit: 'cover' }}
                                              />
                                            </div>
                                          )}

                                          {/* Trade Info */}
                                          <div className="flex flex-col flex-1 gap-1">
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <span style={{ color: actionColor, fontSize: '15px', lineHeight: '24px', fontWeight: 500, letterSpacing: '0.15px' }}>
                                                  {actionText}
                                                </span>
                                                {/* Only show market subtitle if there are multiple markets */}
                                                {sortedMarkets.length > 1 && (
                                                  <span style={{ color: 'white', fontSize: '15px', lineHeight: '24px', fontWeight: 500, letterSpacing: '0.15px' }}>
                                                    {' · '}{tradeMarket?.yesSubTitle || trade.ticker}
                                                  </span>
                                                )}
                                              </div>
                                              <div style={{ minWidth: '60px', textAlign: 'end' }}>
                                                <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '13px', lineHeight: '20px', fontWeight: 400, letterSpacing: '0.13px' }}>
                                                  {getTimeAgo(trade.createdTime)}
                                                </span>
                                              </div>
                                            </div>
                                            <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', lineHeight: '20px', fontWeight: 400, letterSpacing: '0.13px' }}>
                                              {trade.count} contracts ({priceInCents}¢)
                                            </span>
                                          </div>
                                          </div>
                                        </div>
                                      </FadeIn>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        </div>
                      </FadeIn>

                </>
              )}
            </div>
          )}
            </div>

          {/* Right Column - Trading Card */}
          {!error && event && selectedMarketForTrading && (
            <div {...stylex.props(styles.rightColumn)}>
              <TradingCard
                event={event}
                market={selectedMarketForTrading}
                eventTitle={event.title}
                selectedOutcome={selectedOutcomeForTrading}
                onOutcomeChange={(outcome) => setSelectedOutcomeForTrading(outcome)}
                orderType={orderType}
                onOrderTypeChange={(type) => setOrderType(type)}
                imageUrl={selectedMarketImage || undefined}
              />
            </div>
          )}
          </div>
        )}

        {/* Dialog for mobile trading card */}
        <Dialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DialogContent className="max-w-[100vw] w-fulloverflow-y-auto p-0 bg-transparent border-0">
            <DialogTitle className="sr-only">
              Trade {selectedMarketForTrading?.title || 'Market'}
            </DialogTitle>
            {selectedMarketForTrading && event && (
              <TradingCard
                event={event}
                market={selectedMarketForTrading}
                eventTitle={event.title}
                selectedOutcome={selectedOutcomeForTrading}
                onOutcomeChange={(outcome) => setSelectedOutcomeForTrading(outcome)}
                orderType={orderType}
                onOrderTypeChange={(type) => setOrderType(type)}
                imageUrl={selectedMarketImage || undefined}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
