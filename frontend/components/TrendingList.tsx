'use client';

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { useRouter } from "next/navigation";

const styles = stylex.create({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  item: {
    display: "block",
    cursor: "pointer",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
    opacity: 0,
    transform: "translateY(20px)",
    transitionProperty: "opacity, transform, background-color",
    transitionDuration: "500ms",
    transitionTimingFunction: "ease-out",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.02)",
    },
    ":last-child": {
      borderBottomWidth: 0,
    },
  },
  itemVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },
  itemContent: {
    display: "flex",
    gap: "1.5rem",
    padding: "1.5rem 0",
    alignItems: "center",
    "@media (max-width: 640px)": {
      gap: "0.75rem",
      padding: "1rem 0",
    },
  },
  textContent: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  categoryBadge: {
    marginBottom: "0.5rem",
  },
  categoryLabel: {
    fontSize: "0.625rem",
    fontWeight: 900,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
  },
  title: {
    fontSize: "1.125rem",
    fontWeight: 700,
    color: "#fafafa",
    lineHeight: 1.3,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textTransform: "uppercase",
    letterSpacing: "-0.02em",
    transitionProperty: "color",
    transitionDuration: "300ms",
  },
  titleHover: {
    color: "#a3a3a3",
  },
  stats: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginTop: "0.25rem",
  },
  chanceSection: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  chanceValue: {
    fontSize: "1.125rem",
    fontWeight: 900,
    color: "#fafafa",
    letterSpacing: "-0.05em",
  },
  chanceLabel: {
    fontSize: "0.5rem",
    fontWeight: 900,
    color: "#a3a3a3",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    paddingLeft: "0.25rem",
  },
  divider: {
    height: "1rem",
    width: "1px",
    backgroundColor: "#404040",
  },
  metaText: {
    fontSize: "0.625rem",
    fontWeight: 900,
    color: "#525252",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  imageContainer: {
    flexShrink: 0,
    width: "96px",
    height: "96px",
    overflow: "hidden",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#262626",
    backgroundColor: "#0a0a0a",
    borderRadius: "0.25rem",
    transitionProperty: "transform",
    transitionDuration: "300ms",
    transitionTimingFunction: "ease-out",
    position: "relative",
    "@media (max-width: 640px)": {
      width: "80px",
      height: "80px",
      flexShrink: 1,
    },
    "@media (max-width: 400px)": {
      width: "60px",
      height: "60px",
    },
  },
  imageContainerHover: {
    transform: "scale(1.05)",
  },
  imageContainerOffset: {
    marginTop: "0.5rem",
  },
  imageOverlay: {
    opacity: 0.45,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: 900,
    color: "#60a5fa",
    backgroundColor: "#1a1a1a",
  },
  overlayChanceBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.125rem",
  },
  overlayChanceValue: {
    fontSize: "2.25rem",
    fontWeight: 900,
    color: "#fafafa",
    letterSpacing: "-0.05em",
    lineHeight: 1,
  },
  overlayChanceLabel: {
    fontSize: "0.5rem",
    fontWeight: 900,
    color: "#a3a3a3",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
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
  category?: string;
  [key: string]: any;
}

interface TrendingListProps {
  events: KalshiEvent[];
  marketTitles?: Record<string, Record<string, string>>; // Map of event ticker to market ticker to title
  marketImages?: Record<string, string>; // Map of market ticker to image URL
  enableScrollFade?: boolean; // Enable fade in/out on scroll
  imagePosition?: 'left' | 'right'; // Position of the image (default: 'right')
  overlayChance?: boolean; // Show chance badge on top of image (discover style)
}

// Helper function to format odds as percentage
const formatOdds = (lastPrice: number | undefined): number => {
  if (lastPrice === undefined || lastPrice === null || isNaN(lastPrice)) return 0;
  return Math.round(lastPrice);
};

// Helper to get the image URL for an event
const getEventImageUrl = (event: KalshiEvent): string | null => {
  if (event.markets && event.markets.length > 0) {
    for (const market of event.markets) {
      if ((market as any).imageUrl || (market as any).image) {
        return (market as any).imageUrl || (market as any).image;
      }
    }
  }
  return event.imageUrl || null;
};

// Extract category from series_ticker or sub_title
const getCategory = (event: KalshiEvent): string => {
  if (event.category) return event.category;

  if (event.series_ticker) {
    const parts = event.series_ticker.split('-');
    if (parts.length > 0) {
      return parts[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
    }
  }

  return 'General';
};

// Get meta text from event
const getMetaText = (event: KalshiEvent): string => {
  if (event.sub_title) return event.sub_title;

  const closeTime = (event.markets?.[0] as any)?.expiration_time || (event.markets?.[0] as any)?.close_time;
  if (closeTime) {
    try {
      const closeDate = new Date(closeTime);
      if (!isNaN(closeDate.getTime())) {
        return `In ${closeDate.getFullYear()}`;
      }
    } catch (e) {
      // Ignore error
    }
  }

  return '';
};

export default function TrendingList({ events, marketTitles, marketImages, enableScrollFade = false, imagePosition = 'right', overlayChance = false }: TrendingListProps) {
  const router = useRouter();
  const [hoveredEvent, setHoveredEvent] = React.useState<string | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [visibleItems, setVisibleItems] = React.useState<Set<string>>(new Set());
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Map<string, HTMLAnchorElement>>(new Map());

  // Initial fade-in animation (for non-scroll-fade mode)
  React.useEffect(() => {
    if (enableScrollFade) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [enableScrollFade]);

  // Scroll-based fade in/out (for scroll-fade mode)
  React.useEffect(() => {
    if (!enableScrollFade) return;

    // Find the scrollable container (chart-news-news-wrapper)
    let scrollContainer = containerRef.current?.parentElement;
    while (scrollContainer && !scrollContainer.classList.contains('chart-news-news-wrapper')) {
      scrollContainer = scrollContainer.parentElement;
    }

    // Find the ticker element to listen for animation iterations
    let tickerElement = containerRef.current?.parentElement;
    while (tickerElement && !tickerElement.classList.contains('trending-ticker')) {
      tickerElement = tickerElement.parentElement;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleItems((prev) => {
          const newSet = new Set(prev);
          entries.forEach((entry) => {
            const ticker = entry.target.getAttribute('data-ticker');
            if (ticker && entry.isIntersecting && entry.intersectionRatio >= 0.6) {
              newSet.add(ticker);
            }
          });
          return newSet;
        });
      },
      {
        threshold: [0, 0.3, 0.6, 1],
        root: scrollContainer,
      }
    );

    // Reset visible items when animation loops
    const handleAnimationIteration = () => {
      setVisibleItems(new Set());
    };

    if (tickerElement) {
      tickerElement.addEventListener('animationiteration', handleAnimationIteration);
    }

    itemRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      if (tickerElement) {
        tickerElement.removeEventListener('animationiteration', handleAnimationIteration);
      }
    };
  }, [events, enableScrollFade]);

  return (
    <div ref={containerRef} {...stylex.props(styles.container)}>
      {events.map((event, index) => {
        const category = getCategory(event);
        const activeMarkets = event.markets?.filter((market: any) => market.status === 'active') || [];
        const topMarket = activeMarkets.length > 0
          ? activeMarkets.reduce((max, market) =>
              (parseFloat(market.last_price_dollars || '0') * 100) > (parseFloat(max.last_price_dollars || '0') * 100) ? market : max
            )
          : null;
        const chance = topMarket ? formatOdds(parseFloat(topMarket.last_price_dollars || '0') * 100) : 0;
        const metaText = getMetaText(event);

        // Use market image from metadata API if valid, otherwise use event-level imageUrl
        const marketImageRaw = topMarket && marketImages && marketImages[topMarket.ticker];
        const marketImage = marketImageRaw && marketImageRaw.trim() !== '' && !marketImageRaw.includes('fallback') ? marketImageRaw : null;
        const imageUrl = marketImage || event.imageUrl || null;

        // Always use market-level title from dflow API if available (for ALL events, not just multi-market)
        const eventMarketTitles = marketTitles && marketTitles[event.event_ticker];
        const displayTitle = topMarket && eventMarketTitles && eventMarketTitles[topMarket.ticker]
          ? eventMarketTitles[topMarket.ticker]
          : event.title || 'Untitled Event';

        const isHovered = hoveredEvent === event.event_ticker;
        const itemVisible = enableScrollFade
          ? visibleItems.has(event.event_ticker)
          : isVisible;

        return (
          <a
            key={event.event_ticker}
            ref={(el) => {
              if (el && enableScrollFade) {
                itemRefs.current.set(event.event_ticker, el);
              }
            }}
            data-ticker={event.event_ticker}
            {...stylex.props(styles.item, itemVisible && styles.itemVisible)}
            style={{ transitionDelay: enableScrollFade ? '0ms' : `${index * 100}ms` }}
            onClick={() => router.push(`/events/${event.event_ticker}`)}
            onMouseEnter={() => setHoveredEvent(event.event_ticker)}
            onMouseLeave={() => setHoveredEvent(null)}
            onTouchStart={() => setHoveredEvent(event.event_ticker)}
            onTouchEnd={() => setHoveredEvent(null)}
          >
            <div {...stylex.props(styles.itemContent)}>
              {imagePosition === 'left' && (
                <div {...stylex.props(styles.imageContainer, isHovered && styles.imageContainerHover)}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={event.title}
                      {...stylex.props(styles.image)}
                      loading="lazy"
                    />
                  ) : (
                    <div {...stylex.props(styles.imagePlaceholder)}>
                      {event.title?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              )}
              <div {...stylex.props(styles.textContent)}>
                {metaText && (
                  <div {...stylex.props(styles.categoryBadge)}>
                    <span {...stylex.props(styles.categoryLabel)}>{metaText}</span>
                  </div>
                )}
                <h4 {...stylex.props(styles.title)}>
                  {displayTitle}
                </h4>
                <div {...stylex.props(styles.stats)}>
                  <div {...stylex.props(styles.chanceSection)}>
                    <span {...stylex.props(styles.chanceValue)}>{chance}%</span>
                    <span {...stylex.props(styles.chanceLabel)}>Chance</span>
                  </div>
                  <div {...stylex.props(styles.divider)} />
                  <span {...stylex.props(styles.categoryLabel)}>{category}</span>
                </div>
              </div>
              {imagePosition === 'right' && (
                <div {...stylex.props(styles.imageContainer, isHovered && styles.imageContainerHover)}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={event.title}
                      {...stylex.props(styles.image)}
                      loading="lazy"
                    />
                  ) : (
                    <div {...stylex.props(styles.imagePlaceholder)}>
                      {event.title?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
