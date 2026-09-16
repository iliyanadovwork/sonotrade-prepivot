'use client';

import * as stylex from "@stylexjs/stylex";
import { useState, useEffect } from "react";
import DiscoverCard from "./DiscoverCard";
import TrendingList from "./TrendingList";

const styles = stylex.create({
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: "1rem",
    marginBottom: "2rem",
    contain: "layout style",
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "repeat(1, 1fr)",
      width: "100%",
      maxWidth: "100%",
      overflow: "hidden",
    },
    "@media (max-width: 768px)": {
      gap: "0.75rem",
    },
  },
  leftColumn: {
    gridColumn: "span 4",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "#262626",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
    "@media (max-width: 1024px)": {
      gridColumn: "span 1",
      order: 3,
      display: "flex",
      flexDirection: "column",
      borderTopWidth: "0px",
      borderBottomWidth: "0px",
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
    },
  },
  trendingListWrapper: {
    "@media (max-width: 1024px)": {
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderTopColor: "#262626",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderBottomColor: "#262626",
    },
  },
  mobileHeader: {
    display: "none",
    "@media (max-width: 1024px)": {
      display: "flex",
      alignItems: "center",
      fontSize: "1.5rem",
      fontWeight: 700,
      color: "#fafafa",
      marginBottom: "0.75rem",
      marginTop: "1rem",
    },
  },
  middleColumn: {
    gridColumn: "span 4",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxHeight: "100%", // Match trending list height
    overflow: "visible", // Allow cards to escape on hover
    "@media (max-width: 1024px)": {
      gridColumn: "span 1",
      maxHeight: "none",
      order: 1,
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
    },
    "@media (max-width: 768px)": {
      gap: "0.75rem",
    },
  },
  middleCard: {
    flex: 1,
    minHeight: 0,
    overflow: "visible", // Allow card to lift up on hover
    "@media (max-width: 1024px)": {
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
    },
  },
  rightColumn: {
    gridColumn: "span 4",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxHeight: "100%", // Match trending list height
    overflow: "visible", // Allow cards to escape on hover
    "@media (max-width: 1024px)": {
      gridColumn: "span 1",
      maxHeight: "none",
      order: 2,
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
    },
    "@media (max-width: 768px)": {
      gap: "0.75rem",
    },
  },
  rightCard: {
    flex: 1,
    minHeight: 0,
    overflow: "visible", // Allow card to lift up on hover
    "@media (max-width: 1024px)": {
      width: "100%",
      maxWidth: "100%",
      minWidth: 0,
    },
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

interface DiscoverGridProps {
  events: KalshiEvent[];
  marketTitles?: Record<string, Record<string, string>>; // Map of event ticker to market ticker to title
  marketImages?: Record<string, string>; // Map of market ticker to image URL (for left column only)
}

export default function DiscoverGrid({ events, marketTitles, marketImages }: DiscoverGridProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Split events: 6 for trending list, 3 for middle, 2 for right
  const trendingEvents = events.slice(0, 6);
  const middleEvents = events.slice(6, 9);
  const rightEvents = events.slice(9, 11);

  return (
    <div {...stylex.props(styles.container)}>
      {/* Left Column - Trending List */}
      <div {...stylex.props(styles.leftColumn)}>
        <div {...stylex.props(styles.mobileHeader)}>
          Trending
          {isMobile && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#737373', marginLeft: '0.5rem', marginTop: '0.25rem', display: 'block', flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </div>
        <div {...stylex.props(styles.trendingListWrapper)}>
          <TrendingList
            events={trendingEvents}
            marketTitles={marketTitles}
            marketImages={marketImages}
            imagePosition={isMobile ? "right" : "left"}
            overlayChance={!isMobile}
          />
        </div>
      </div>

      {/* Middle Column - Three Stacked Cards */}
      <div {...stylex.props(styles.middleColumn)}>
        {middleEvents.map((event, index) => (
          <div key={event.event_ticker} {...stylex.props(styles.middleCard)}>
            <DiscoverCard
              event={event}
              index={index}
              compact={true}
              marketTitles={marketTitles ? marketTitles[event.event_ticker] : undefined}
            />
          </div>
        ))}
      </div>

      {/* Right Column - Two Stacked Cards */}
      <div {...stylex.props(styles.rightColumn)}>
        {rightEvents.map((event, index) => (
          <div key={event.event_ticker} {...stylex.props(styles.rightCard)}>
            <DiscoverCard
              event={event}
              index={index}
              compact={true}
              tallImage="8 / 5"
              marketTitles={marketTitles ? marketTitles[event.event_ticker] : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
