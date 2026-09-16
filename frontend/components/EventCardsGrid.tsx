'use client';

import * as stylex from "@stylexjs/stylex";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const styles = stylex.create({
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    minHeight: "500px", // Reserve space to prevent collapse
    contain: "layout style",
    "@media (max-width: 1536px)": {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    "@media (max-width: 768px)": {
      gap: "0.75rem",
    },
    "@media (max-width: 640px)": {
      gridTemplateColumns: "repeat(1, 1fr)",
    },
  },
  card: {
    position: "relative",
    backgroundColor: "transparent",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#262626",
    padding: "1rem",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    minHeight: "203px",
    height: "fit-content",
    minWidth: 0,
    opacity: 0,
    // Use will-change to prevent layout shift during animation
    willChange: "opacity",
    // Only animate opacity to prevent layout shifts
    transition: "opacity 600ms ease-out, border-color 200ms ease-out, box-shadow 200ms ease-out, transform 200ms ease-out",
    overflow: "hidden",
    // Prevent layout shift by containing layout
    contain: "layout style paint",
    ":hover": {
      borderColor: "rgba(255, 255, 255, 0.42)",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
    },
    "@media (min-width: 769px)": {
      ":hover": {
        borderColor: "rgba(255, 255, 255, 0.42)",
        transform: "translateY(-2px)",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  cardContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  cardVisible: {
    opacity: 1,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1rem",
    minWidth: 0,
    ":hover img": {
      transform: "scale(1.1)",
    },
    ":hover .image-placeholder": {
      transform: "scale(1.1)",
    },
  },
  imageWrapper: {
    flexShrink: 0,
    width: "40px",
    height: "40px",
    contain: "layout size style",
  },
  eventImage: {
    width: "40px",
    height: "40px",
    borderRadius: "0.375rem",
    objectFit: "cover",
    backgroundColor: "#262626",
    flexShrink: 0,
    transitionProperty: "transform",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease",
  },
  eventImagePlaceholder: {
    width: "40px",
    height: "40px",
    borderRadius: "0.375rem",
    backgroundColor: "#262626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#60a5fa",
    flexShrink: 0,
    transitionProperty: "transform",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease",
  },
  eventInfo: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  eventTitle: {
    fontWeight: 600,
    color: "#fafafa",
    fontSize: "0.875rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    cursor: "pointer",
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.8)",
  },
  marketsContainer: {
    minWidth: 0,
  },
  marketsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
    minWidth: 0,
  },
  marketItem: {
    fontSize: "0.8125rem",
    color: "#d4d4d4",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 0,
  },
  marketText: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    flex: 1,
    minWidth: 0,
    position: "relative",
    maskImage: "linear-gradient(to right, black 60%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to right, black 60%, transparent 100%)",
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.8)",
  },
  marketOdds: {
    fontSize: "0.8125rem",
    color: "#fafafa",
    fontWeight: 500,
    minWidth: "3rem",
    flexShrink: 0,
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.8)",
  },
  marketLeftContent: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  eventOdds: {
    fontSize: "1rem",
    color: "#fafafa",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    height: "40px",
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.8)",
  },
  yesNoButton: {
    position: "relative",
    borderRadius: "0.375rem",
    height: "32px",
    width: "70px",
    flexShrink: 0,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#262626",
    backgroundColor: "transparent",
    transitionProperty: "opacity, transform",
    transitionDuration: "300ms",
    cursor: "pointer",
    ":hover": {
      opacity: 0.8,
      borderColor: "rgba(255, 255, 255, 0.42)",

    },
    "@media (max-width: 768px)": {
      ":hover": {
        transform: "scale(0.95)",
      },
      ":active": {
        transform: "scale(0.9)",
      },
    },
  },
  twoButtonContainer: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "-0.5rem",
    marginTop: "auto",
  },
  singleButton: {
    position: "relative",
    borderRadius: "0.375rem",
    height: "44px",
    flex: 1,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#262626",
    transitionProperty: "opacity, transform, border-color",
    transitionDuration: "300ms",
    cursor: "pointer",
    "@media (min-width: 769px)": {
      height: "40px",
    },
    ":hover": {
      opacity: 0.8,
      borderColor: "rgba(255, 255, 255, 0.42)",
    },
    "@media (max-width: 768px)": {
      ":hover": {
        transform: "scale(0.95)",
      },
      ":active": {
        transform: "scale(0.9)",
      },
    },
  },
  yesButton: {
    position: "absolute",
    inset: 0,
    borderRadius: "0.375rem",
    backgroundColor: "transparent",
  },
  noButton: {
    position: "absolute",
    inset: 0,
    borderRadius: "0.375rem",
    backgroundColor: "transparent",
  },
  buttonContent: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  yesNoGradient: {
    position: "absolute",
    inset: 0,
    borderRadius: "0.375rem",
    backgroundImage: "none",
  },
  yesNoContent: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "0.5rem",
  },
  yesText: {
    fontSize: "10px",
    color: "#00d9ff",
    fontWeight: 500,
    textTransform: "capitalize",
  },
  dividerText: {
    fontSize: "10px",
    color: "#262626",
  },
  noText: {
    fontSize: "10px",
    color: "#ff007f",
    fontWeight: 500,
    textTransform: "capitalize",
  },
  yesTextLarge: {
    fontSize: "14px",
    color: "#00d9ff",
    fontWeight: 500,
    textTransform: "capitalize",
  },
  noTextLarge: {
    fontSize: "14px",
    color: "#ff007f",
    fontWeight: 500,
    textTransform: "capitalize",
  },
  yesPriceText: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#22DAFF",
  },
  noPriceText: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#CD0768",
  },
  statItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1rem",
  },
  moreText: {
    fontSize: "0.8125rem",
    fontWeight: 400,
    color: "#616161",
  },
  statValue: {
    fontSize: "0.8125rem",
    fontWeight: 400,
    color: "#616161",
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

interface EventCardsGridProps {
  events: KalshiEvent[];
}

// Helper function to format large numbers
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '$0.00';
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
};

// Helper function to format odds as percentage
const formatOdds = (lastPrice: number | undefined): string => {
  if (lastPrice === undefined || lastPrice === null || isNaN(lastPrice)) return '--%';
  
  // lastPrice is already in cents (0-100 format)
  return `${Math.round(lastPrice)}%`;
};

export default function EventCardsGrid({ events }: EventCardsGridProps) {
  const router = useRouter();
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [cardDelayIndices, setCardDelayIndices] = useState<Map<string, number>>(new Map());
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport once
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper to get the image URL for an event
  const getEventImageUrl = (event: KalshiEvent): string | null => {
    // First, check if any market has an image in metadata
    if (event.markets && event.markets.length > 0) {
      for (const market of event.markets) {
        if (market.imageUrl || market.image) {
          return market.imageUrl || market.image;
        }
      }
    }
    // Fall back to event-level imageUrl
    return event.imageUrl || null;
  };

  // Track delay indices for each card based on when they were added
  useEffect(() => {
    const newMap = new Map(cardDelayIndices);
    const currentBatchStartIndex = newMap.size; // Number of cards we've seen before
    let hasNewCards = false;

    events.forEach((event, globalIndex) => {
      if (!newMap.has(event.event_ticker)) {
        // This is a new card - calculate its position within the current batch
        const positionInBatch = globalIndex - currentBatchStartIndex;
        newMap.set(event.event_ticker, positionInBatch);
        hasNewCards = true;
      }
    });

    // Only update state if there are actually new cards
    if (hasNewCards) {
      setCardDelayIndices(newMap);
    }
  }, [events]);

  useEffect(() => {
    if (isMobile) {
      // On mobile: Use IntersectionObserver for scroll-based fade-in
      setVisibleCards((prev) => {
        const newSet = new Set(prev);
        // Only add first 3 if this is the initial load (prev is empty)
        if (prev.size === 0 && events.length > 0) {
          events.slice(0, 3).forEach(e => newSet.add(e.event_ticker));
        }
        return newSet;
      });

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const ticker = entry.target.getAttribute('data-ticker');
              if (ticker) {
                setVisibleCards((prev) => new Set([...prev, ticker]));
              }
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px',
        }
      );
    } else {
      // On desktop: Only add NEW cards to visible set, don't recreate entire set
      setVisibleCards((prev) => {
        const newSet = new Set(prev);
        events.forEach(e => {
          if (!newSet.has(e.event_ticker)) {
            newSet.add(e.event_ticker);
          }
        });
        return newSet;
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [events, isMobile]);

  const cardRef = (element: HTMLDivElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  return (
    <div {...stylex.props(styles.cardsGrid)}>
      {events.map((event, index) => {
        const imageUrl = getEventImageUrl(event);
        const isVisible = visibleCards.has(event.event_ticker);
        const isHovered = hoveredCard === event.event_ticker;

        // On desktop, add staggered delay based on when the card was first added
        const delayIndex = cardDelayIndices.get(event.event_ticker) ?? index;
        const transitionDelay = !isMobile ? `${delayIndex * 50}ms` : '0ms';

        return (
          <div
            key={event.event_ticker}
            {...stylex.props(styles.card, isVisible && styles.cardVisible)}
            style={{
              transition: `opacity 600ms ease-out ${transitionDelay}, border-color 200ms ease-out, box-shadow 200ms ease-out, transform 200ms ease-out`
            }}
            onClick={() => router.push(`/events/${event.event_ticker}`)}
            onMouseEnter={() => setHoveredCard(event.event_ticker)}
            onMouseLeave={() => setHoveredCard(null)}
            ref={cardRef}
            data-ticker={event.event_ticker}
          >
            {/* Card Content */}
            <div {...stylex.props(styles.cardContent)}>
            <div {...stylex.props(styles.cardHeader)}>
              <div {...stylex.props(styles.imageWrapper)}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={event.title}
                    {...stylex.props(styles.eventImage)}
                    loading="lazy"
                  />
                ) : (
                  <div {...stylex.props(styles.eventImagePlaceholder)} className="image-placeholder">
                    {event.title?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div {...stylex.props(styles.eventInfo)}>
                <div {...stylex.props(styles.eventTitle)}>
                  {event.title || 'Untitled Event'}
                </div>
              </div>
              {(!event.markets || event.markets.length === 0) && (
                <div {...stylex.props(styles.eventOdds)}>
                  --%
                </div>
              )}
            </div>

            {event.markets && event.markets.length > 1 ? (
              <div {...stylex.props(styles.marketsContainer)}>
                <div {...stylex.props(styles.marketsList)}>
                  {event.markets
                    .sort((a, b) => (parseFloat(b.last_price_dollars || '0') * 100) - (parseFloat(a.last_price_dollars || '0') * 100))
                    .slice(0, 2)
                    .map((market: KalshiMarket, idx: number) => (
                    <div key={idx} {...stylex.props(styles.marketItem)}>
                      <div {...stylex.props(styles.marketLeftContent)}>
                        <span {...stylex.props(styles.marketOdds)}>
                          {formatOdds(parseFloat(market.last_price_dollars || '0') * 100)}
                        </span>
                        <span {...stylex.props(styles.marketText)}>{market.yes_sub_title}</span>
                      </div>
                      <div {...stylex.props(styles.yesNoButton)}>
                        <div {...stylex.props(styles.yesNoGradient)}></div>
                        <div {...stylex.props(styles.yesNoContent)}>
                          <span {...stylex.props(styles.yesText)}>Yes</span>
                          <span {...stylex.props(styles.dividerText)}>/</span>
                          <span {...stylex.props(styles.noText)}>No</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div {...stylex.props(styles.marketsContainer)}>
                <div {...stylex.props(styles.marketsList)}>
                  <div {...stylex.props(styles.marketItem)}>
                    <div {...stylex.props(styles.marketLeftContent)}>
                      <span {...stylex.props(styles.marketOdds)}>
                        {formatOdds(parseFloat(event.markets?.[0]?.last_price_dollars || '0') * 100)}
                      </span>
                      <span {...stylex.props(styles.marketText)}>Yes</span>
                    </div>
                    <div {...stylex.props(styles.yesNoButton)}>
                      <div {...stylex.props(styles.yesNoContent)}>
                        <span {...stylex.props(styles.yesPriceText)}>
                          {event.markets?.[0]?.status === 'finalized'
                            ? (event.markets[0].expiration_value === 'Yes' ? '100¢' : '0¢')
                            : (event.markets?.[0]?.yes_ask_dollars != null ? `${Math.round(parseFloat(event.markets[0].yes_ask_dollars) * 100)}¢` : '--')
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div {...stylex.props(styles.marketItem)}>
                    <div {...stylex.props(styles.marketLeftContent)}>
                      <span {...stylex.props(styles.marketOdds)}>
                        {formatOdds(event.markets?.[0]?.last_price_dollars != null ? 100 - parseFloat(event.markets[0].last_price_dollars) * 100 : undefined)}
                      </span>
                      <span {...stylex.props(styles.marketText)}>No</span>
                    </div>
                    <div {...stylex.props(styles.yesNoButton)}>
                      <div {...stylex.props(styles.yesNoContent)}>
                        <span {...stylex.props(styles.noPriceText)}>
                          {event.markets?.[0]?.status === 'finalized'
                            ? (event.markets[0].expiration_value === 'No' ? '100¢' : '0¢')
                            : (event.markets?.[0]?.yes_bid_dollars != null ? `${Math.round(100 - parseFloat(event.markets[0].yes_bid_dollars) * 100)}¢` : '--')
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

<div {...stylex.props(styles.statItem)}>
  {event.markets && event.markets.length > 2 ? (
    <span {...stylex.props(styles.moreText)}>
      +{event.markets.length - 2} more
    </span>
  ) : (
    <span {...stylex.props(styles.moreText)}>1 market</span>
  )}

  <div {...stylex.props(styles.statValue)}>
    {formatNumber(
      event.markets && event.markets.length > 0
        ? event.markets.reduce(
            (total, market) => total + parseFloat(market.volume_fp || '0'),
            0
          )
        : 0
    )} Vol.
  </div>
</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
