"use client";

import React, { useEffect, useState, useMemo } from "react";
import * as stylex from "@stylexjs/stylex";
import { Group } from "@visx/group";
import { AxisBottom, AxisRight } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { scaleLinear, scaleTime } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { curveStepAfter } from "@visx/curve";
import { useTooltip } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { bisector } from "d3-array";
import { apiClient } from "@/lib/api/client";
import NumberFlow from '@number-flow/react';
import {
  CardContent,
} from "@/components/ui/card";
import STSkeletonGlyph from "./layout/STSkeletonGlyph";

interface ChartDataPoint {
  rawTimestamp: number;
  timestamp: string;
  [key: string]: any;
}

interface Market {
  ticker: string;
  title?: string;
  subtitle?: string;
  yesSubTitle?: string;
  noSubTitle?: string;
  probability?: number;
  openTime?: number;
}

interface SingleLineChartProps {
  interval?: string;
  markets: Market[];
  eventTicker: string;
  initiallyVisibleMarkets?: string[];
  onMarketToggle?: (ticker: string, isVisible: boolean) => void;
  volume?: number;
  closeTime?: number;
}

const CHART_COLORS = [
  "#2D9CDB", // primary blue
  "#ec4899", // pink
  "#10b981", // green
  "#fbbf24", // yellow
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
  "#a855f7", // violet
  "#ef4444", // red
];

const styles = stylex.create({
  mainContainer: {
    height: "auto",
    width: "100%",
    maxWidth: "100%",
    overflow: "visible",
  },
  legendContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: 0,
    marginTop: 0,
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendItemsWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    alignItems: "center",
    "@media (max-width: 640px)": {
      marginLeft: "0rem",
      marginRight:"0rem"
    },
  },
  legendItem: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  colorIndicator: {
    minWidth: "8px",
    minHeight: "8px",
    borderRadius: "0.375rem",
  },
  labelText: {
    fontSize: "13px",
    lineHeight: 1.25,
    fontWeight: 400,
    color: "#7a7a7a",
  },
  valueContainer: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    minWidth: "45px",
  },
  valueText: {
    fontSize: "13px",
    lineHeight: 1.25,
    fontWeight: 500,
    color: "white",
  },
  cardContent: {
    gap: 0,
    padding: 0,
    "@media (min-width: 640px)": {
      gap: 0,
    },
  },
  chartWrapper: {
    width: "100%",
    maxWidth: "100%",
    padding: 0,
    margin: 0,
    overflow: "visible",
    "@media (max-width: 640px)": {
      marginRight: "1rem",
    },
  },
  loadingContainer: {
    height: "350px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#9ca3af",
  },
  tooltipContainer: {
    backgroundColor: "#1a1a1a",
    padding: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#404040",
    borderRadius: "0.25rem",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    color: "white",
  },
  chartBottomControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.5rem",
    position: "relative",
    gap: "1rem",
    "@media (max-width: 640px)": {
      marginLeft: "0rem",
      marginRight: "0rem",
      marginTop: "0.75rem",
      marginBottom: "0.5rem",
      gap: "0.5rem",
    },
  },
  bottomStatsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    alignItems: "center",
    flex: "0 1 auto",
  },
  settingsButton: {
    backgroundColor: "transparent",
    borderWidth: "0",
    borderStyle: "none",
    borderColor: "transparent",
    borderRadius: "0",
    padding: "0",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 200ms",
    ":hover": {
      opacity: 0.8,
    },
    ":active": {
      transform: "scale(0.95)",
    },
  },
});

// Chart dimensions - margins will be adjusted based on screen size

const SingleLineChart: React.FC<SingleLineChartProps> = ({
  interval = "all",
  markets,
  eventTicker,
  initiallyVisibleMarkets,
  onMarketToggle,
  volume,
  closeTime,
}) => {
  const [selectedYes, setSelectedYes] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartConfig, setChartConfig] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredChance, setHoveredChance] = useState<number | undefined>(undefined);
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [fetchedMarkets, setFetchedMarkets] = useState<Set<string>>(new Set());
  const [marketDataCache, setMarketDataCache] = useState<Map<string, any>>(new Map());
  const lastToggledRef = React.useRef<{ ticker: string; isVisible: boolean } | null>(null);

  const [dimensions, setDimensions] = useState({ width: 922, height: 272 });
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [animatingLines, setAnimatingLines] = useState<Set<string>>(new Set());

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<ChartDataPoint>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
        const container = document.getElementById("group-chart-container");
        if (container) {
          const containerWidth = container.clientWidth || container.offsetWidth || container.getBoundingClientRect().width;
          // Use the full container width
          const finalWidth = containerWidth > 0 ? containerWidth : (window.innerWidth - 32);
          setDimensions({
            width: Math.floor(finalWidth),
            height: 272,
          });
        }
      };
      // Initial resize after a short delay to ensure container is rendered
      const timer = setTimeout(handleResize, 0);
      // Also try immediately
      handleResize();

      window.addEventListener("resize", handleResize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  // Trigger animation when chart data changes
  useEffect(() => {
    if (chartData.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1500);

      // Recalculate dimensions when data loads to ensure accurate sizing
      setTimeout(() => {
        const container = document.getElementById("group-chart-container");
        if (container) {
          const containerWidth = container.clientWidth || container.offsetWidth || container.getBoundingClientRect().width;
          const finalWidth = containerWidth > 0 ? containerWidth : (window.innerWidth - 32);
          setDimensions({
            width: Math.floor(finalWidth),
            height: 272,
          });
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [chartData]);

  useEffect(() => {
    const fetchAllMarketData = async () => {
      if (!markets || markets.length === 0 || !eventTicker) {
        setChartData([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const now = Math.floor(Date.now() / 1000);

        const earliestOpenTime = markets.reduce((earliest, market) => {
          if (!market.openTime) return earliest;
          return !earliest || market.openTime < earliest ? market.openTime : earliest;
        }, 0 as number);

        const defaultStartTs = now - (365 * 24 * 60 * 60);
        const startTs = earliestOpenTime || defaultStartTs;

        const marketsToFetch = initiallyVisibleMarkets && initiallyVisibleMarkets.length > 0
          ? markets.filter(m => initiallyVisibleMarkets.includes(m.ticker))
          : markets.slice(0, 4);

        // Fetch candlesticks with fallback from 60-minute to 1440-minute intervals
        const candlestickPromises = marketsToFetch.map(async (market) => {
          try {
            // For 60-minute intervals, limit to ~200 days to stay under 5000 candlestick limit
            // 200 days * 24 hours = 4800 candlesticks (under the 5000 limit)
            const startTs60 = now - (200 * 24 * 60 * 60);

            // Try with 60-minute (hourly) intervals first
            let result = await apiClient.getMarketCandlesticks(market.ticker, {
              startTs: startTs60,
              endTs: now,
              periodInterval: 60,
            });

            // If no data or failed, try with 1440-minute (daily) intervals using full time range
            if (!result.success || !result.data?.candlesticks || result.data.candlesticks.length === 0) {
              console.warn(`No data with 60-min interval for ${market.ticker}, trying 1440-min`);
              result = await apiClient.getMarketCandlesticks(market.ticker, {
                startTs,
                endTs: now,
                periodInterval: 1440,
              });
            }

            return result;
          } catch (error) {
            console.error(`Failed to fetch candlesticks for ${market.ticker}:`, error);

            // On error, try with daily intervals as fallback
            try {
              console.warn(`Retrying ${market.ticker} with 1440-min interval`);
              const result = await apiClient.getMarketCandlesticks(market.ticker, {
                startTs,
                endTs: now,
                periodInterval: 1440,
              });
              return result;
            } catch (retryError) {
              return { success: false, data: { candlesticks: [] } };
            }
          }
        });

        const results = await Promise.all(candlestickPromises);

        const allMarketData = marketsToFetch.map((market, index) => {
          const result = results[index];
          const candles = result.data?.candlesticks || [];

          if (!candles || candles.length === 0) {
            return null;
          }

          const yesProcessed = candles
            .filter((candle: any) => candle.price?.mean != null)
            .map((candle: any) => ({
              rawTimestamp: candle.end_period_ts,
              timestamp: new Date(candle.end_period_ts * 1000).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
              }),
              asset1: candle.price.mean,
            }));

          // Extend last point to present time
          if (yesProcessed.length > 0) {
            const lastPoint = yesProcessed[yesProcessed.length - 1];
            const now = Math.floor(Date.now() / 1000);
            yesProcessed.push({
              rawTimestamp: now,
              timestamp: new Date(now * 1000).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
              }),
              asset1: lastPoint.asset1,
            });
          }

          const noProcessed = candles
            .filter((candle: any) => candle.price?.mean != null)
            .map((candle: any) => ({
              rawTimestamp: candle.end_period_ts,
              timestamp: new Date(candle.end_period_ts * 1000).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
              }),
              asset1: 100 - candle.price.mean,
            }));

          // Extend last point to present time
          if (noProcessed.length > 0) {
            const lastPoint = noProcessed[noProcessed.length - 1];
            const now = Math.floor(Date.now() / 1000);
            noProcessed.push({
              rawTimestamp: now,
              timestamp: new Date(now * 1000).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
              }),
              asset1: lastPoint.asset1,
            });
          }

          const originalIndex = markets.findIndex(m => m.ticker === market.ticker);

          return {
            ticker: market.ticker,
            title: market.yesSubTitle || market.title || `Market ${originalIndex + 1}`,
            yesData: yesProcessed,
            noData: noProcessed,
            color: CHART_COLORS[originalIndex % CHART_COLORS.length],
          };
        }).filter(Boolean);

        if (allMarketData.length === 0) {
          setChartData([]);
          setLoading(false);
          return;
        }

        const timestampMap = new Map<number, any>();

        allMarketData.forEach((marketData: any) => {
          const dataToUse = selectedYes ? marketData.yesData : marketData.noData;

          dataToUse.forEach((point: any) => {
            const rawNum = Number(point.rawTimestamp);
            if (!Number.isFinite(rawNum)) return;
            const tsKey = rawNum;

            if (!timestampMap.has(tsKey)) {
              timestampMap.set(tsKey, {
                timestamp: point.timestamp,
                rawTimestamp: tsKey,
              });
            }

            const entry = timestampMap.get(tsKey)!;
            entry[marketData.ticker] = point.asset1;
          });
        });

        const mergedData = Array.from(timestampMap.values()).sort(
          (a, b) => a.rawTimestamp - b.rawTimestamp
        );

        setChartData(mergedData);

        const newCache = new Map(marketDataCache);
        allMarketData.forEach((marketData: any) => {
          newCache.set(marketData.ticker, marketData);
        });
        setMarketDataCache(newCache);

        const newFetchedMarkets = new Set(fetchedMarkets);
        marketsToFetch.forEach(m => newFetchedMarkets.add(m.ticker));
        setFetchedMarkets(newFetchedMarkets);

        const config: any = {};
        const initialVisibility: Record<string, boolean> = {};

        markets.forEach((market, index) => {
          config[market.ticker] = {
            label: market.yesSubTitle || market.title || `Market ${index + 1}`,
            color: CHART_COLORS[index % CHART_COLORS.length],
          };
          if (initiallyVisibleMarkets && initiallyVisibleMarkets.length > 0) {
            initialVisibility[market.ticker] = initiallyVisibleMarkets.includes(market.ticker);
          } else {
            initialVisibility[market.ticker] = index < 4;
          }
        });
        setChartConfig(config);
        setVisibleLines(initialVisibility);

      } catch (error) {
        console.error("Failed to fetch market data:", error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMarketData();
  }, [markets, interval, selectedYes, eventTicker]);

  const fetchMarketCandlesticks = async (market: Market) => {
    if (fetchedMarkets.has(market.ticker)) {
      return;
    }

    try {
      const now = Math.floor(Date.now() / 1000);

      const earliestOpenTime = markets.reduce((earliest, m) => {
        if (!m.openTime) return earliest;
        return !earliest || m.openTime < earliest ? m.openTime : earliest;
      }, 0 as number);

      const defaultStartTs = now - (365 * 24 * 60 * 60);
      const startTs = earliestOpenTime || defaultStartTs;

      // For 60-minute intervals, limit to ~200 days to stay under 5000 candlestick limit
      // 200 days * 24 hours = 4800 candlesticks (under the 5000 limit)
      const startTs60 = now - (200 * 24 * 60 * 60);

      // Try with 60-minute (hourly) intervals first
      let result;
      let candles;

      try {
        result = await apiClient.getMarketCandlesticks(market.ticker, {
          startTs: startTs60,
          endTs: now,
          periodInterval: 60,
        });

        candles = result.data?.candlesticks || [];

        // If no data, try with 1440-minute (daily) intervals using full time range
        if (!candles || candles.length === 0) {
          console.warn(`No data with 60-min interval for ${market.ticker}, trying 1440-min`);
          result = await apiClient.getMarketCandlesticks(market.ticker, {
            startTs,
            endTs: now,
            periodInterval: 1440,
          });
          candles = result.data?.candlesticks || [];
        }
      } catch (error) {
        // On error (like exceeding limit), try with daily intervals
        console.warn(`Error fetching 60-min data for ${market.ticker}, trying 1440-min:`, error);
        result = await apiClient.getMarketCandlesticks(market.ticker, {
          startTs,
          endTs: now,
          periodInterval: 1440,
        });
        candles = result.data?.candlesticks || [];
      }

      if (!candles || candles.length === 0) {
        return;
      }

      const yesData = candles
        .filter((candle: any) => candle.price?.mean != null)
        .map((candle: any) => ({
          rawTimestamp: candle.end_period_ts,
          timestamp: new Date(candle.end_period_ts * 1000).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
          }),
          asset1: candle.price.mean,
        }));

      // Extend last point to present time
      if (yesData.length > 0) {
        const lastPoint = yesData[yesData.length - 1];
        const now = Math.floor(Date.now() / 1000);
        yesData.push({
          rawTimestamp: now,
          timestamp: new Date(now * 1000).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
          }),
          asset1: lastPoint.asset1,
        });
      }

      const noData = candles
        .filter((candle: any) => candle.price?.mean != null)
        .map((candle: any) => ({
          rawTimestamp: candle.end_period_ts,
          timestamp: new Date(candle.end_period_ts * 1000).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
          }),
          asset1: 100 - candle.price.mean,
        }));

      // Extend last point to present time
      if (noData.length > 0) {
        const lastPoint = noData[noData.length - 1];
        const now = Math.floor(Date.now() / 1000);
        noData.push({
          rawTimestamp: now,
          timestamp: new Date(now * 1000).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
          }),
          asset1: lastPoint.asset1,
        });
      }

      const originalIndex = markets.findIndex(m => m.ticker === market.ticker);

      const marketData = {
        ticker: market.ticker,
        title: market.yesSubTitle || market.title || `Market ${originalIndex + 1}`,
        yesData,
        noData,
        color: CHART_COLORS[originalIndex % CHART_COLORS.length],
      };

      const newCache = new Map(marketDataCache);
      newCache.set(market.ticker, marketData);
      setMarketDataCache(newCache);

      const newFetchedMarkets = new Set(fetchedMarkets);
      newFetchedMarkets.add(market.ticker);
      setFetchedMarkets(newFetchedMarkets);

      setChartConfig((prev: any) => ({
        ...prev,
        [market.ticker]: {
          label: marketData.title,
          color: marketData.color,
        },
      }));

      const dataSource = selectedYes ? marketData.yesData : marketData.noData;
      const timestampMap = new Map<number, any>();

      chartData.forEach((point) => {
        timestampMap.set(point.rawTimestamp, { ...point });
      });

      dataSource.forEach((point: any) => {
        const tsKey = point.rawTimestamp;
        if (!timestampMap.has(tsKey)) {
          timestampMap.set(tsKey, {
            timestamp: point.timestamp,
            rawTimestamp: tsKey,
          });
        }
        const entry = timestampMap.get(tsKey)!;
        entry[market.ticker] = point.asset1;
      });

      const mergedData = Array.from(timestampMap.values()).sort(
        (a, b) => a.rawTimestamp - b.rawTimestamp
      );

      setChartData(mergedData);

    } catch (error) {
      console.error(`Failed to fetch candlesticks for ${market.ticker}:`, error);
    }
  };

  const toggleLineVisibility = async (ticker: string) => {
    const willBeVisible = !visibleLines[ticker];

    if (willBeVisible && !fetchedMarkets.has(ticker)) {
      const market = markets.find(m => m.ticker === ticker);
      if (market) {
        await fetchMarketCandlesticks(market);
      }
    }

    setVisibleLines(prev => {
      const newVisibility = { ...prev, [ticker]: !prev[ticker] };

      const visibleCount = Object.values(newVisibility).filter(Boolean).length;
      if (visibleCount === 0) {
        return prev;
      }

      // If turning on a line, animate it
      if (newVisibility[ticker]) {
        setAnimatingLines(current => new Set(current).add(ticker));
        // Remove from animating set after animation completes
        setTimeout(() => {
          setAnimatingLines(current => {
            const next = new Set(current);
            next.delete(ticker);
            return next;
          });
        }, 1500);
      }

      lastToggledRef.current = { ticker, isVisible: newVisibility[ticker] };

      return newVisibility;
    });
  };

  React.useEffect(() => {
    if (lastToggledRef.current && onMarketToggle) {
      const { ticker, isVisible } = lastToggledRef.current;
      onMarketToggle(ticker, isVisible);
      lastToggledRef.current = null;
    }
  }, [visibleLines, onMarketToggle]);

  const visibleChartConfig = Object.keys(chartConfig)
    .filter(ticker => visibleLines[ticker])
    .reduce((acc, ticker) => {
      acc[ticker] = chartConfig[ticker];
      return acc;
    }, {} as any);

  // Responsive margins - tighter on mobile
  const chartMargin = useMemo(() => {
    if (screenWidth < 640) {
      return { top: 5, right: 40, bottom: 30, left: 0 };
    }
    return { top: 5, right: 35, bottom: 30, left: 0 };
  }, [screenWidth]);

  // visx scales
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: chartData.length > 0
          ? [chartData[0].rawTimestamp, chartData[chartData.length - 1].rawTimestamp]
          : [0, 1],
        range: [0, dimensions.width - chartMargin.left - chartMargin.right],
      }),
    [chartData, dimensions.width, chartMargin]
  );

  const yScale = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    chartData.forEach((point) => {
      Object.keys(visibleChartConfig).forEach((ticker) => {
        const value = point[ticker];
        if (value !== null && value !== undefined) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });

    if (!isFinite(min) || !isFinite(max)) {
      min = 0;
      max = 100;
    }

    const range = max - min;
    const padding = range * 0.1;

    const paddedMin = Math.max(0, min - padding);
    const paddedMax = Math.min(100, max + padding);

    return scaleLinear<number>({
      domain: [paddedMax, paddedMin],
      range: [0, dimensions.height - chartMargin.top - chartMargin.bottom],
    });
  }, [chartData, visibleChartConfig, dimensions.height, chartMargin]);

  // Bisector for tooltip
  const bisectDate = bisector<ChartDataPoint, number>((d) => d.rawTimestamp).left;

  const handleTooltip = (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
    const point = localPoint(event);
    if (!point) return;

    const x0 = xScale.invert(point.x - chartMargin.left);
    
    // Don't show hover dot if cursor is beyond the last data point
    if (chartData.length > 0) {
      const lastDataPoint = chartData[chartData.length - 1];
      if (x0 > lastDataPoint.rawTimestamp) {
        hideTooltip();
        setHoveredChance(undefined);
        setHoverX(null);
        return;
      }
    }
    
    const index = bisectDate(chartData, x0, 1);
    const d0 = chartData[index - 1];
    const d1 = chartData[index];
    let d = d0;
    if (d1 && d1.rawTimestamp) {
      d = x0 - d0.rawTimestamp > d1.rawTimestamp - x0 ? d1 : d0;
    }

    if (d) {
      // For single market, update hover chance
      if (Object.keys(visibleChartConfig).length === 1) {
        const ticker = Object.keys(visibleChartConfig)[0];
        const value = d[ticker];
        if (value !== undefined && value !== null) {
          setHoveredChance(value / 100);
        }
      }

      // Set hover X position for gray line effect
      setHoverX(point.x - chartMargin.left);

      showTooltip({
        tooltipData: d,
        tooltipLeft: point.x,
        tooltipTop: point.y,
      });
    }
  };

  return (
    <div {...stylex.props(styles.mainContainer)}>
      <div>
        {/* Legend */}
        {Object.keys(visibleChartConfig).length > 0 && (
          <div {...stylex.props(styles.legendContainer)}>
            <div
              {...stylex.props(styles.legendItemsWrapper)}
              style={markets.length > 1 ? { marginBottom: '1rem', marginTop: '0.5rem' } : {}}
            >
              {markets.length === 1 ? (
                (() => {
                  const ticker = Object.keys(visibleChartConfig)[0];

                  let displayValue: number;

                  if (hoveredChance !== undefined) {
                    displayValue = hoveredChance * 100;
                  } else {
                    let latestValue: number | undefined;
                    for (let i = chartData.length - 1; i >= 0; i--) {
                      if (chartData[i][ticker] !== undefined && chartData[i][ticker] !== null) {
                        latestValue = chartData[i][ticker];
                        break;
                      }
                    }
                    displayValue = latestValue ?? 0;
                  }

                  return (
                      <span style={{ marginBottom: "1rem", display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '32px', fontWeight: 700, color: '#fafafa', display: 'flex', alignItems: 'baseline' }}>
                          <NumberFlow
                            value={displayValue}
                            format={{
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }}
                            style={{
                              fontSize: '32px',
                              fontWeight: 700,
                              color: '#fafafa'
                            }}
                          />
                          <span>%</span>
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 300, color: '#a3a3a3' }}>
                          chance
                        </span>
                      </span>
                  );
                })()
              ) : (
                Object.keys(visibleChartConfig).map((ticker) => {
                  const config = visibleChartConfig[ticker];

                  // When hovering, calculate the value at hover position using bisector (same as gray line)
                  let latestValue: number | undefined;

                  if (hoverX !== null) {
                    // Use same logic as hover dots to get value at hover position
                    const tickerData = chartData.filter(d => d[ticker] != null);
                    if (tickerData.length > 0) {
                      const hoverTimestamp = xScale.invert(hoverX);
                      // Only show hover value if cursor is at or after this line's first point
                      if (hoverTimestamp >= tickerData[0].rawTimestamp) {
                        const index = bisectDate(tickerData, hoverTimestamp, 1);
                        const d0 = tickerData[index - 1];
                        // For curveStepAfter, always use d0 (the point before hover)
                        const pointToUse = d0;
                        latestValue = pointToUse ? pointToUse[ticker] : undefined;
                      }
                    }
                  }

                  // If not hovering, use latest value from chart data
                  if (latestValue === undefined) {
                    for (let i = chartData.length - 1; i >= 0; i--) {
                      if (chartData[i][ticker] !== undefined && chartData[i][ticker] !== null) {
                        latestValue = chartData[i][ticker];
                        break;
                      }
                    }
                  }

                  const displayValue = latestValue != null ? latestValue.toFixed(0) : '0';

                  return (
                    <div key={ticker} {...stylex.props(styles.legendItem)}>
                      <div
                        {...stylex.props(styles.colorIndicator)}
                        style={{ backgroundColor: config.color }}
                      />
                      <span {...stylex.props(styles.labelText)}>
                        {config.label}
                      </span>
                      <div {...stylex.props(styles.valueContainer)}>
                        <span {...stylex.props(styles.valueText)}>
                          {displayValue}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <CardContent className="gap-0 sm:gap-0 p-0 w-full">
          <div {...stylex.props(styles.chartWrapper)}>
            <CardContent className="p-0">
              {loading && (
                <div {...stylex.props(styles.loadingContainer)}>
                  <STSkeletonGlyph size={48} />
                </div>
              )}
              {!loading && chartData.length === 0 && (
                <div {...stylex.props(styles.loadingContainer)}>
                  <p {...stylex.props(styles.loadingText)}>No trading data available</p>
                </div>
              )}
              {!loading && chartData.length > 0 && (
                <>
                  <div
                    id="group-chart-container"
                    className="flex flex-1 w-full max-w-full relative box-border mt-0"
                    style={{ height: `${dimensions.height}px`, width: '100%' }}
                  >
                    <div className="flex w-full h-full relative" style={{ opacity: 1, width: '100%' }}>
                      <svg
                        width={dimensions.width}
                        height={dimensions.height}
                        style={{ maxWidth: '100%', display: 'block', overflow: 'visible' }}
                      >
                        <defs>
                          {/* Clip path for progressive reveal animation (initial) */}
                          <clipPath id="reveal-clip">
                            <rect
                              x="0"
                              y="0"
                              width={dimensions.width - chartMargin.left - chartMargin.right}
                              height={dimensions.height - chartMargin.top - chartMargin.bottom}
                              style={{
                                animation: isAnimating ? 'reveal-line 1.5s ease-out forwards' : 'none',
                                transformOrigin: 'left center',
                              }}
                            />
                          </clipPath>

                          {/* Clip paths for individual line animations */}
                          {Array.from(animatingLines).map((ticker) => (
                            <clipPath key={`clip-${ticker}`} id={`reveal-clip-${ticker}`}>
                              <rect
                                x="0"
                                y="0"
                                width={dimensions.width - chartMargin.left - chartMargin.right}
                                height={dimensions.height - chartMargin.top - chartMargin.bottom}
                                style={{
                                  animation: 'reveal-line 1.5s ease-out forwards',
                                  transformOrigin: 'left center',
                                }}
                              />
                            </clipPath>
                          ))}

                          {/* Clip path for hover effect - left part (colored) */}
                          <clipPath id="hover-left-clip">
                            <rect
                              x="0"
                              y="0"
                              width={hoverX ?? (dimensions.width - chartMargin.left - chartMargin.right)}
                              height={dimensions.height - chartMargin.top - chartMargin.bottom}
                            />
                          </clipPath>

                          {/* Clip path for hover effect - right part (gray) */}
                          <clipPath id="hover-right-clip">
                            <rect
                              x={hoverX ?? 0}
                              y="0"
                              width={(dimensions.width - chartMargin.left - chartMargin.right) - (hoverX ?? 0)}
                              height={dimensions.height - chartMargin.top - chartMargin.bottom}
                            />
                          </clipPath>

                        </defs>

                        <Group top={chartMargin.top} left={chartMargin.left}>
                          {/* Axes */}
                          <AxisBottom
                            top={dimensions.height - chartMargin.top - chartMargin.bottom}
                            scale={xScale}
                            numTicks={screenWidth < 640 ? 4 : 8}
                            stroke="transparent"
                            tickStroke="transparent"
                            tickLabelProps={() => ({
                              fill: 'var(--neutral-200, #a3a3a3)',
                              fontSize: 12,
                              fontFamily: 'Arial',
                              textAnchor: 'middle',
                            })}
                            tickFormat={(value) => {
                              const numValue = Number(value);
                              const date = new Date(numValue * 1000);
                              return date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              });
                            }}
                          />

                          <AxisRight
                            left={dimensions.width - chartMargin.left - chartMargin.right}
                            scale={yScale}
                            numTicks={4}
                            stroke="transparent"
                            tickStroke="transparent"
                            tickLabelProps={() => ({
                              fill: 'var(--neutral-200, #a3a3a3)',
                              fontSize: 12,
                              fontFamily: 'Arial',
                              textAnchor: 'start',
                            })}
                            tickFormat={(value) => `${Number(value).toFixed(0)}%`}
                          />

                          {/* Grid */}
                          <GridRows
                            scale={yScale}
                            width={dimensions.width - chartMargin.left - chartMargin.right}
                            numTicks={5}
                            stroke="var(--neutral-300, #404040)"
                            strokeWidth={1}
                            strokeDasharray="1,3"
                            strokeOpacity={0.5}
                            pointerEvents="none"
                          />

                          {/* Lines with progressive reveal */}
                          {Object.keys(visibleChartConfig).map((ticker) => {
                            const config = visibleChartConfig[ticker];
                            const lineData = chartData.filter(d => d[ticker] != null);

                            if (lineData.length === 0) return null;

                            const isLineAnimating = isAnimating || animatingLines.has(ticker);
                            const clipPathId = animatingLines.has(ticker)
                              ? `url(#reveal-clip-${ticker})`
                              : (isAnimating ? "url(#reveal-clip)" : undefined);

                            return (
                              <Group key={ticker} clipPath={clipPathId}>
                                {/* Colored part (left of hover) */}
                                <Group clipPath={hoverX !== null ? "url(#hover-left-clip)" : undefined}>
                                    {/* Background/shadow line */}
                                    <LinePath
                                      data={lineData}
                                      x={(d) => xScale(d.rawTimestamp) ?? 0}
                                      y={(d) => yScale(d[ticker]) ?? 0}
                                      stroke="var(--neutral-50, #fafafa)"
                                      strokeWidth={2}
                                      strokeOpacity={0.15}
                                      curve={curveStepAfter}
                                    />

                                    {/* Main line */}
                                    <LinePath
                                      data={lineData}
                                      x={(d) => xScale(d.rawTimestamp) ?? 0}
                                      y={(d) => yScale(d[ticker]) ?? 0}
                                      stroke={config.color}
                                      strokeWidth={1.75}
                                      curve={curveStepAfter}
                                    />

                                    {/* Shimmer effect line (for animation) */}
                                    <LinePath
                                      data={lineData}
                                      x={(d) => xScale(d.rawTimestamp) ?? 0}
                                      y={(d) => yScale(d[ticker]) ?? 0}
                                      stroke={config.color}
                                      strokeWidth={2.75}
                                      strokeOpacity={0}
                                      curve={curveStepAfter}
                                      style={{
                                        animation: isAnimating ? 'none' : 'shimmer 3s ease-in-out infinite',
                                      }}
                                    />
                                  </Group>

                                  {/* Gray part (right of hover) */}
                                  {hoverX !== null && (
                                    <Group clipPath="url(#hover-right-clip)">
                                      {/* Background/shadow line */}
                                      <LinePath
                                        data={lineData}
                                        x={(d) => xScale(d.rawTimestamp) ?? 0}
                                        y={(d) => yScale(d[ticker]) ?? 0}
                                        stroke="var(--neutral-50, #fafafa)"
                                        strokeWidth={2}
                                        strokeOpacity={0.15}
                                        curve={curveStepAfter}
                                      />

                                      {/* Main line (gray) */}
                                      <LinePath
                                        data={lineData}
                                        x={(d) => xScale(d.rawTimestamp) ?? 0}
                                        y={(d) => yScale(d[ticker]) ?? 0}
                                        stroke="#404040"
                                        strokeWidth={1.75}
                                        curve={curveStepAfter}
                                      />
                                    </Group>
                                  )}
                                </Group>
                            );
                          })}

                          {/* End-of-line dots (when not hovering) */}
                          {hoverX === null && !isAnimating && Object.keys(visibleChartConfig).map((ticker) => {
                            const config = visibleChartConfig[ticker];
                            const lineData = chartData.filter(d => d[ticker] != null);

                            if (lineData.length === 0) return null;

                            // Don't show pulsating dot if line is currently animating
                            if (animatingLines.has(ticker)) return null;

                            const lastPoint = lineData[lineData.length - 1];
                            const xPos = xScale(lastPoint.rawTimestamp) ?? 0;
                            const yPos = yScale(lastPoint[ticker]) ?? 0;

                            return (
                              <g key={`end-dot-${ticker}`}>
                                {/* Pulsating outer ring */}
                                <circle
                                  cx={xPos}
                                  cy={yPos}
                                  r={6}
                                  fill={config.color}
                                  fillOpacity={0.7}
                                  stroke="none"
                                  style={{
                                    animation: 'pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                  }}
                                />
                                {/* Inner dot */}
                                <circle
                                  cx={xPos}
                                  cy={yPos}
                                  r={1.5}
                                  fill={config.color}
                                  stroke={config.color}
                                />
                              </g>
                            );
                          })}

                          {/* Hover dots at x position for ALL visible lines */}
                          {hoverX !== null && tooltipData && (() => {
                            // Collect all hover data
                            const hoverData: Array<{
                              ticker: string;
                              config: any;
                              value: number;
                              yPos: number;
                            }> = [];

                            Object.keys(visibleChartConfig).forEach((ticker) => {
                              const config = visibleChartConfig[ticker];
                              const tickerData = chartData.filter(d => d[ticker] != null);
                              if (tickerData.length === 0) return;

                              const hoverTimestamp = xScale.invert(hoverX);

                              // Don't show dot/label before this line's first data point
                              if (hoverTimestamp < tickerData[0].rawTimestamp) return;

                              const index = bisectDate(tickerData, hoverTimestamp, 1);
                              const d0 = tickerData[index - 1];
                              // For curveStepAfter, always use d0 (the point before hover)
                              // because the line holds d0's value until it steps to the next point
                              const pointToUse = d0;

                              const value = pointToUse ? pointToUse[ticker] : null;
                              if (value == null || value === undefined) return;

                              const yPos = yScale(value) ?? 0;
                              hoverData.push({ ticker, config, value, yPos });
                            });

                            // Sort by y position
                            hoverData.sort((a, b) => a.yPos - b.yPos);

                            // Adjust positions to avoid overlap
                            const minSpacing = 24; // Minimum pixels between labels (increased for larger text)
                            const adjustedPositions: number[] = [];

                            hoverData.forEach((item, i) => {
                              let adjustedY = item.yPos;

                              // Check against all previous labels
                              for (let j = 0; j < i; j++) {
                                const prevY = adjustedPositions[j];
                                if (Math.abs(adjustedY - prevY) < minSpacing) {
                                  adjustedY = prevY + minSpacing;
                                }
                              }

                              adjustedPositions.push(adjustedY);
                            });

                            return hoverData.map((item, i) => (
                              <g key={`hover-dot-${item.ticker}`}>
                                {/* Outer ring (no animation on hover) */}
                                <circle
                                  cx={hoverX}
                                  cy={item.yPos}
                                  r={6}
                                  fill={item.config.color}
                                  fillOpacity={0.7}
                                  stroke="none"
                                />
                                {/* Inner dot */}
                                <circle
                                  cx={hoverX}
                                  cy={item.yPos}
                                  r={1.5}
                                  fill={item.config.color}
                                  stroke={item.config.color}
                                />
                                {/* Percentage label */}
                                <text
                                  x={hoverX + 12}
                                  y={adjustedPositions[i] + 5}
                                  fill={item.config.color}
                                  fontSize={18}
                                  fontWeight={700}
                                  fontFamily="Arial"
                                  textAnchor="start"
                                  style={{
                                    transition: 'y 0.3s ease-out'
                                  }}
                                >
                                  {item.value.toFixed(0)}%
                                </text>
                              </g>
                            ));
                          })()}

                          {/* Invisible overlay for tooltip */}
                          <rect
                            x={0}
                            y={0}
                            width={dimensions.width - chartMargin.left - chartMargin.right}
                            height={dimensions.height - chartMargin.top - chartMargin.bottom}
                            fill="transparent"
                            onTouchStart={handleTooltip}
                            onTouchMove={handleTooltip}
                            onMouseMove={handleTooltip}
                            onMouseLeave={() => {
                              hideTooltip();
                              setHoveredChance(undefined);
                              setHoverX(null);
                            }}
                            onTouchEnd={() => {
                              hideTooltip();
                              setHoveredChance(undefined);
                              setHoverX(null);
                            }}
                          />
                        </Group>
                      </svg>
                    </div>
                  </div>

                  {/* Settings button and dropdown below chart */}
                  <div {...stylex.props(styles.chartBottomControls)}>
                    <div {...stylex.props(styles.bottomStatsContainer)}>
                      {volume !== undefined && (
                        <span {...stylex.props(styles.labelText)}>
                          ${(volume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Vol.
                        </span>
                      )}
                    </div>

                    {Object.keys(chartConfig).length > 1 && (
                      <>
                        <button
                          {...stylex.props(styles.settingsButton)}
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
                            <path d="M8 16V11M12 16V8M16 16V14M12 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12" stroke="#7a7a7a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                            <path d="M19 2V5M19 8V5M19 5H22M19 5H16" stroke="#a3a3a3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                          </svg>
                        </button>
                        {isDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsDropdownOpen(false)}
                          />

                          <div
                            className="absolute z-20 bottom-[3rem] right-0 min-w-[240px] bg-[#000000] border border-[#262626] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                            style={{
                              animation: 'dropdown-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                              transformOrigin: 'bottom right'
                            }}
                          >
                            {Object.keys(chartConfig).map((ticker, index) => {
                              const config = chartConfig[ticker];
                              const isVisible = visibleLines[ticker];
                              const visibleCount = Object.values(visibleLines).filter(Boolean).length;
                              const isLastVisible = isVisible && visibleCount === 1;

                              return (
                                <button
                                  key={ticker}
                                  onClick={() => !isLastVisible && toggleLineVisibility(ticker)}
                                  disabled={isLastVisible}
                                  className={`w-full px-4 py-2.5 text-left text-[15px] transition-colors flex items-center gap-3 ${
                                    index === 0 ? 'rounded-t-lg' : ''
                                  } ${
                                    index === Object.keys(chartConfig).length - 1 ? 'rounded-b-lg' : ''
                                  } ${
                                    isLastVisible
                                      ? 'opacity-50 cursor-not-allowed'
                                      : 'hover:bg-[#101010] cursor-pointer'
                                  } ${
                                    isVisible
                                      ? 'bg-[#1a1a1a] text-white'
                                      : 'text-[#a3a3a3]'
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                      isVisible
                                        ? 'border-[#60a5fa] bg-[#60a5fa]'
                                        : 'border-[#404040] bg-transparent'
                                    }`}
                                  >
                                    {isVisible && (
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                      >
                                        <path
                                          d="M2 6L5 9L10 3"
                                          stroke="white"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 flex-1">
                                    <div
                                      className="w-2 h-2 rounded-sm flex-shrink-0"
                                      style={{ backgroundColor: config.color }}
                                    />
                                    <span className={isVisible ? 'text-white' : 'text-[#a3a3a3]'}>
                                      {config.label}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                      </>
                    )}
                  </div>

                  {/* Animations */}
                  <style jsx global>{`
                    @keyframes shimmer {
                      0%, 100% {
                        stroke-opacity: 0;
                      }
                      50% {
                        stroke-opacity: 0.3;
                      }
                    }

                    @keyframes reveal-line {
                      from {
                        transform: scaleX(0);
                      }
                      to {
                        transform: scaleX(1);
                      }
                    }

                    @keyframes pulse-dot {
                      0%, 100% {
                        r: 6;
                        opacity: 0.7;
                      }
                      50% {
                        r: 9;
                        opacity: 0.2;
                      }
                    }
                  `}</style>
                </>
              )}
            </CardContent>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default SingleLineChart;
