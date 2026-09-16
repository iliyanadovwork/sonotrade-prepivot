'use client';

import * as stylex from "@stylexjs/stylex";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
const styles = stylex.create({
  card: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0a0a0a",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#262626",
    borderRadius: "0.5rem",
    cursor: "pointer",
    opacity: 0,
    transform: "translateY(20px)",
    transitionProperty: "opacity, transform, border-color, box-shadow, z-index",
    transitionDuration: "500ms",
    transitionTimingFunction: "ease-out",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    // Prevent layout shift but allow overflow (no paint containment)
    contain: "layout style",
    zIndex: 1,
    ":hover": {
      borderColor: "rgba(255, 255, 255, 0.42)",
      boxShadow: "0 40px 80px -15px rgba(0, 0, 0, 0.5)",
      zIndex: 10,
    },
    "@media (min-width: 769px)": {
      ":hover": {
        transform: "translateY(-8px)",
      },
    },
    "@media (max-width: 768px)": {
      ":active": {
        borderColor: "rgba(255, 255, 255, 0.42)",
        boxShadow: "0 40px 80px -15px rgba(0, 0, 0, 0.5)",
        zIndex: 10,
      },
    },
    "@media (max-width: 640px)": {
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
    },
    "@media (max-width: 1024px)": {
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
    },
  },
  cardVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
    aspectRatio: "5 / 4",
    backgroundColor: "#1a1a1a",
    // Reserve space to prevent layout shift
    minHeight: "1px",
    contain: "layout size",
    "@media (max-width: 640px)": {
      aspectRatio: "auto",
      minHeight: "180px",
      contain: "layout",
      width: "100%",
    },
  },
  tallImageContainer: {
    position: "relative",
    overflow: "hidden",
    aspectRatio: "4 / 5",
    backgroundColor: "#1a1a1a",
    // Reserve space to prevent layout shift
    minHeight: "1px",
    contain: "layout size",
    "@media (max-width: 640px)": {
      aspectRatio: "auto",
      minHeight: "180px",
      contain: "layout",
      width: "100%",
    },
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transitionProperty: "transform",
    transitionDuration: "1500ms",
    transitionTimingFunction: "ease-out",
  },
  imageHover: {
    transform: "scale(1.1)",
  },
  chanceBadge: {
    position: "absolute",
    top: "1.25rem",
    left: "1.25rem",
    backgroundColor: "#000000",
    color: "#ffffff",
    padding: "0.5rem 0.75rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
    zIndex: 20,
    borderRadius: "0.25rem",
    transitionProperty: "transform",
    transitionDuration: "500ms",
  },
  chanceBadgeHover: {
    transform: "scale(1.1) translateY(-4px)",
  },
  chanceBadgeContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.125rem",
  },
  chanceValue: {
    fontSize: "1.5rem",
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-0.05em",
  },
  chanceLabel: {
    fontSize: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    color: "#a3a3a3",
    fontWeight: 900,
  },
  content: {
    padding: "1rem",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/monogram.png')",
    backgroundRepeat: "repeat",
    backgroundSize: "600px 600px",
    backgroundPosition: "center",
    position: "relative",
    boxShadow: "inset 0 12px 20px -8px rgba(0, 0, 0, 0.9)",
    zIndex: 2,
    "@media (max-width: 640px)": {
      padding: "0.75rem",
      minWidth: 0,
      width: "100%",
      maxWidth: "100%",
    },
    "@media (max-width: 1024px)": {
      minWidth: 0,
      width: "100%",
      maxWidth: "100%",
    },
  },
  categoryBadge: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  categoryLabel: {
    fontSize: "0.5625rem",
    fontWeight: 900,
    color: "#a3a3a3",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "#fafafa",
    lineHeight: 1.3,
    marginTop: "0.25rem",
    marginBottom: "0.75rem",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textTransform: "uppercase",
    letterSpacing: "-0.02em",
    transitionProperty: "color",
    transitionDuration: "300ms",
    "@media (min-width: 640px)": {
      fontSize: "1rem",
    },
  },
  titleHover: {
    color: "#a3a3a3",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "#262626",
    paddingTop: "0.75rem",
    marginTop: "auto",
  },
  volumeSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.125rem",
  },
  volumeLabel: {
    fontSize: "0.5rem",
    fontWeight: 900,
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: "0.3em",
  },
  volumeValue: {
    fontSize: "0.6875rem",
    fontWeight: 900,
    color: "#fafafa",
    letterSpacing: "-0.02em",
    textTransform: "uppercase",
  },
  tradeButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    transitionProperty: "transform",
    transitionDuration: "300ms",
  },
  tradeButtonHover: {
    transform: "translateX(4px)",
  },
  tradeText: {
    fontSize: "0.5625rem",
    fontWeight: 900,
    color: "#fafafa",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "4rem",
    fontWeight: 900,
    color: "#60a5fa",
    backgroundColor: "#1a1a1a",
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

interface DiscoverCardProps {
  event: KalshiEvent;
  index?: number;
  compact?: boolean;
  marketTitles?: Record<string, string>; // Map of market ticker to title
  tallImage?: boolean | string; // For taller image aspect ratio (boolean or custom ratio)
}

// Helper function to format large numbers
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '$0.00';
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(1)}K`;
  }
  return `$${num.toFixed(2)}`;
};

// Helper function to format odds as percentage
const formatOdds = (lastPrice: number | undefined): number => {
  if (lastPrice === undefined || lastPrice === null || isNaN(lastPrice)) return 0;
  return Math.round(lastPrice);
};

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

// Extract category from series_ticker or sub_title
const getCategory = (event: KalshiEvent): string => {
  if (event.category) return event.category;

  // Try to extract from series_ticker
  if (event.series_ticker) {
    const parts = event.series_ticker.split('-');
    if (parts.length > 0) {
      return parts[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
    }
  }

  return 'General';
};

export default function DiscoverCard({ event, index = 0, compact = false, marketTitles, tallImage = false }: DiscoverCardProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get the highest probability market from active markets only
  const activeMarkets = event.markets?.filter((market: any) => market.status === 'active') || [];
  const topMarket = activeMarkets.length > 0
    ? activeMarkets.reduce((max, market) =>
        (parseFloat(market.last_price_dollars || '0') * 100) > (parseFloat(max.last_price_dollars || '0') * 100) ? market : max
      )
    : null;

  const chance = topMarket ? formatOdds(parseFloat(topMarket.last_price_dollars || '0') * 100) : 0;
  const imageUrl = getEventImageUrl(event);
  const category = getCategory(event);

  // For multi-market events, use the market title from the dflow API if available
  const isMultiMarket = event.markets && event.markets.length > 1;
  const displayTitle = isMultiMarket && topMarket && marketTitles && marketTitles[topMarket.ticker]
    ? marketTitles[topMarket.ticker]
    : event.title || 'Untitled Event';

  // Calculate total volume
  const totalVolume = event.markets && event.markets.length > 0
    ? event.markets.reduce((total, market) => total + parseFloat(market.volume_fp || '0'), 0)
    : 0;

  // Intersection Observer for fade-in animation
  useEffect(() => {
    const checkIsMobile = window.innerWidth <= 768;
    setIsMobile(checkIsMobile);

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    router.push(`/events/${event.event_ticker}`);
  };

  const transitionDelay = typeof window !== 'undefined' && window.innerWidth > 768
    ? `${index * 100}ms`
    : '0ms';

  return (
    <div
      ref={cardRef}
      {...stylex.props(styles.card, isVisible && styles.cardVisible)}
      style={{ transitionDelay }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Chance Badge */}
      <div {...stylex.props(styles.chanceBadge, isHovered && styles.chanceBadgeHover)}>
        <div {...stylex.props(styles.chanceBadgeContent)}>
          <span {...stylex.props(styles.chanceValue)}>{chance}%</span>
          <span {...stylex.props(styles.chanceLabel)}>Chance</span>
        </div>
      </div>

      {/* Image */}
      <div {...stylex.props(styles.imageContainer)} style={isMobile ? {} : { aspectRatio: tallImage ? (typeof tallImage === 'string' ? tallImage : '6 / 5') : (compact ? '3 / 1' : '5 / 4') }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            {...stylex.props(styles.image, isHovered && styles.imageHover)}
            loading="lazy"
          />
        ) : (
          <div {...stylex.props(styles.imagePlaceholder)}>
            {event.title?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>

      {/* Content */}
      <div {...stylex.props(styles.content)}>
        {/* Category */}
        <div {...stylex.props(styles.categoryBadge)}>
          <span {...stylex.props(styles.categoryLabel)}>{category}</span>
        </div>

        {/* Title */}
        <h3 {...stylex.props(styles.title, isHovered && styles.titleHover)}>
          {displayTitle}
        </h3>

        {/* Footer */}
        <div {...stylex.props(styles.footer)}>
          <div {...stylex.props(styles.volumeSection)}>
            <span {...stylex.props(styles.volumeLabel)}>Volume</span>
            <span {...stylex.props(styles.volumeValue)}>{formatNumber(totalVolume)}</span>
          </div>
          <div {...stylex.props(styles.tradeButton, isHovered && styles.tradeButtonHover)}>
            <span {...stylex.props(styles.tradeText)}>Trade →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
