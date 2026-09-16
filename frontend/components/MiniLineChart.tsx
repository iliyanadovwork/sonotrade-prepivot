"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
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

interface MiniLineChartProps {
  interval?: string;
  markets: Market[];
  eventTicker: string;
  initiallyVisibleMarkets?: string[];
  onMarketToggle?: (ticker: string, isVisible: boolean) => void;
  onLoaded?: () => void;
  volume?: number;
  closeTime?: string | number;
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
    height: "100%",
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  legendContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: 0,
    marginTop: "1rem",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  legendItemsWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    alignItems: "center",
    justifyContent: "flex-start",
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
    "@media (max-width: 768px)": {
      maxWidth: "120px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
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
    overflow: "hidden",
    boxSizing: "border-box",
    flex: 1,
    display: "flex",
    flexDirection: "column",
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
});

const MiniLineChart: React.FC<MiniLineChartProps> = ({
  interval = "all",
  markets,
  eventTicker,
  initiallyVisibleMarkets,
  onMarketToggle,
  onLoaded,
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
  const [fetchedMarkets, setFetchedMarkets] = useState<Set<string>>(new Set());
  const [marketDataCache, setMarketDataCache] = useState<Map<string, any>>(new Map());
  const lastToggledRef = React.useRef<{ ticker: string; isVisible: boolean } | null>(null);

  const [hoverX, setHoverX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate unique ID for this chart instance to avoid clip path conflicts
  const chartId = useRef(`chart-${Math.random().toString(36).substr(2, 9)}`).current;

  // Responsive dimensions - narrower on mobile
  const dimensions = useMemo(() => {
    if (screenWidth < 640) {
      return { width: 390, height: 240 };
    }
    return { width: 800, height: 272 };
  }, [screenWidth]);

  // Responsive stroke widths and dot sizes for mobile
  const strokeWidth = useMemo(() => screenWidth < 640 ? 1.75 : 1.75, [screenWidth]);
  const strokeWidthShadow = useMemo(() => screenWidth < 640 ? 2 : 2, [screenWidth]);
  const dotOuterRadius = useMemo(() => screenWidth < 640 ? 6 : 6, [screenWidth]);
  const dotInnerRadius = useMemo(() => screenWidth < 640 ? 1.5 : 1.5, [screenWidth]);
  const dotPulseRadius = useMemo(() => screenWidth < 640 ? 9 : 9, [screenWidth]);

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
      };
      handleResize();

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

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

        const candlestickPromises = marketsToFetch.map(async (market) => {
          try {
            const startTs60 = now - (200 * 24 * 60 * 60);

            let result = await apiClient.getMarketCandlesticks(market.ticker, {
              startTs: startTs60,
              endTs: now,
              periodInterval: 60,
            });

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
        onLoaded?.();
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

      const startTs60 = now - (200 * 24 * 60 * 60);

      let result;
      let candles;

      try {
        result = await apiClient.getMarketCandlesticks(market.ticker, {
          startTs: startTs60,
          endTs: now,
          periodInterval: 60,
        });

        candles = result.data?.candlesticks || [];

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
      return { top: 5, right: 25, bottom: 10, left: 0 };
    }
    return { top: 5, right: 5, bottom: 20, left: 0 };
  }, [screenWidth]);

  // visx scales
  const xScale = useMemo(
    () => {
      if (chartData.length > 0) {
        const minTime = chartData[0].rawTimestamp;
        const maxTime = chartData[chartData.length - 1].rawTimestamp;
        const timeRange = maxTime - minTime;
        const rightMargin = timeRange * 0.08; // 8% margin on the right

        return scaleLinear<number>({
          domain: [minTime, maxTime + rightMargin],
          range: [0, dimensions.width - chartMargin.left - chartMargin.right],
        });
      }

      return scaleLinear<number>({
        domain: [0, 1],
        range: [0, dimensions.width - chartMargin.left - chartMargin.right],
      });
    },
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
      if (Object.keys(visibleChartConfig).length === 1) {
        const ticker = Object.keys(visibleChartConfig)[0];
        const value = d[ticker];
        if (value !== undefined && value !== null) {
          setHoveredChance(value / 100);
        }
      }

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
              style={{
                ...(markets.length > 1 ? { marginBottom: '1rem', marginTop: '0.5rem' } : {}),
                ...(typeof window !== 'undefined' && window.innerWidth <= 768 ? { paddingLeft: '0.5rem', paddingRight: '0.5rem' } : {})
              }}
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

                  let latestValue: number | undefined;

                  if (hoverX !== null) {
                    const tickerData = chartData.filter(d => d[ticker] != null);
                    if (tickerData.length > 0) {
                      const hoverTimestamp = xScale.invert(hoverX);
                      if (hoverTimestamp >= tickerData[0].rawTimestamp) {
                        const index = bisectDate(tickerData, hoverTimestamp, 1);
                        const d0 = tickerData[index - 1];
                        const pointToUse = d0;
                        latestValue = pointToUse ? pointToUse[ticker] : undefined;
                      }
                    }
                  }

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

        <CardContent className="gap-0 sm:gap-0 p-0 w-full" style={{ maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box', flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div {...stylex.props(styles.chartWrapper)}>
            <CardContent className="p-0" style={{ maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box', flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              {chartData.length > 0 && (
                <>
                  <div
                    ref={containerRef}
                    className="flex flex-1 w-full max-w-full relative box-border mt-0"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <div className="flex w-full h-full relative" style={{ opacity: 1, width: '100%', height: '100%' }}>
                      <svg
                        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                        style={{ width: '100%', height: '100%', display: 'block' }}
                        preserveAspectRatio="none"
                      >
                        <defs>
                          {/* Clip path for hover effect - left part (colored) */}
                          <clipPath id={`${chartId}-hover-left-clip`}>
                            <rect
                              x="0"
                              y="0"
                              width={hoverX ?? (dimensions.width - chartMargin.left - chartMargin.right)}
                              height={dimensions.height - chartMargin.top - chartMargin.bottom}
                            />
                          </clipPath>

                          {/* Clip path for hover effect - right part (gray) */}
                          <clipPath id={`${chartId}-hover-right-clip`}>
                            <rect
                              x={hoverX ?? 0}
                              y="0"
                              width={(dimensions.width - chartMargin.left - chartMargin.right) - (hoverX ?? 0)}
                              height={dimensions.height - chartMargin.top - chartMargin.bottom}
                            />
                          </clipPath>

                        </defs>

                        <Group top={chartMargin.top} left={chartMargin.left}>
                          {/* Lines */}
                          {Object.keys(visibleChartConfig).map((ticker) => {
                            const config = visibleChartConfig[ticker];
                            const lineData = chartData.filter(d => d[ticker] != null);

                            if (lineData.length === 0) return null;

                            return (
                              <Group key={ticker}>
                                {/* Colored part (left of hover) */}
                                <Group clipPath={hoverX !== null ? `url(#${chartId}-hover-left-clip)` : undefined}>
                                    {/* Background/shadow line */}
                                    <LinePath
                                      data={lineData}
                                      x={(d) => xScale(d.rawTimestamp) ?? 0}
                                      y={(d) => yScale(d[ticker]) ?? 0}
                                      stroke="var(--neutral-50, #fafafa)"
                                      strokeWidth={strokeWidthShadow}
                                      strokeOpacity={0.15}
                                      curve={curveStepAfter}
                                    />

                                    {/* Main line */}
                                    <LinePath
                                      data={lineData}
                                      x={(d) => xScale(d.rawTimestamp) ?? 0}
                                      y={(d) => yScale(d[ticker]) ?? 0}
                                      stroke={config.color}
                                      strokeWidth={strokeWidth}
                                      curve={curveStepAfter}
                                      style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.6))' }}
                                    />
                                  </Group>

                                  {/* Gray part (right of hover) */}
                                  {hoverX !== null && (
                                    <Group clipPath={`url(#${chartId}-hover-right-clip)`}>
                                      {/* Background/shadow line */}
                                      <LinePath
                                        data={lineData}
                                        x={(d) => xScale(d.rawTimestamp) ?? 0}
                                        y={(d) => yScale(d[ticker]) ?? 0}
                                        stroke="var(--neutral-50, #fafafa)"
                                        strokeWidth={strokeWidthShadow}
                                        strokeOpacity={0.15}
                                        curve={curveStepAfter}
                                      />

                                      {/* Main line (gray) */}
                                      <LinePath
                                        data={lineData}
                                        x={(d) => xScale(d.rawTimestamp) ?? 0}
                                        y={(d) => yScale(d[ticker]) ?? 0}
                                        stroke="#404040"
                                        strokeWidth={strokeWidth}
                                        curve={curveStepAfter}
                                        style={{ filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.6))' }}
                                      />
                                    </Group>
                                  )}
                                </Group>
                            );
                          })}

                          {/* End-of-line dots (when not hovering) */}
                          {hoverX === null && (() => {
                            // Collect all end points
                            const endPoints: Array<{
                              ticker: string;
                              config: any;
                              xPos: number;
                              yPos: number;
                              value: number;
                            }> = [];

                            Object.keys(visibleChartConfig).forEach((ticker) => {
                              const config = visibleChartConfig[ticker];
                              const lineData = chartData.filter(d => d[ticker] != null);

                              if (lineData.length === 0) return;

                              const lastPoint = lineData[lineData.length - 1];
                              const xPos = xScale(lastPoint.rawTimestamp) ?? 0;
                              const yPos = yScale(lastPoint[ticker]) ?? 0;

                              endPoints.push({
                                ticker,
                                config,
                                xPos,
                                yPos,
                                value: lastPoint[ticker],
                              });
                            });

                            // Sort by y position
                            endPoints.sort((a, b) => a.yPos - b.yPos);

                            // Adjust positions to avoid overlap
                            const minSpacing = 18; // Minimum pixels between labels
                            const adjustedYPositions: number[] = [];

                            endPoints.forEach((item, i) => {
                              let adjustedY = item.yPos;

                              // Check against all previous labels
                              for (let j = 0; j < i; j++) {
                                const prevY = adjustedYPositions[j];
                                if (Math.abs(adjustedY - prevY) < minSpacing) {
                                  adjustedY = prevY + minSpacing;
                                }
                              }

                              adjustedYPositions.push(adjustedY);
                            });

                            return endPoints.map((item, i) => (
                              <g key={`end-dot-${item.ticker}`}>
                                {/* Pulsating outer ring */}
                                <circle
                                  cx={item.xPos}
                                  cy={item.yPos}
                                  r={dotOuterRadius}
                                  fill={item.config.color}
                                  fillOpacity={0.7}
                                  stroke="none"
                                  style={{
                                    animation: 'mini-pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                  }}
                                />
                                {/* Inner dot */}
                                <circle
                                  cx={item.xPos}
                                  cy={item.yPos}
                                  r={dotInnerRadius}
                                  fill={item.config.color}
                                  stroke={item.config.color}
                                />
                                {/* Percentage label */}
                                <text
                                  x={item.xPos + 12}
                                  y={adjustedYPositions[i] + 5}
                                  fill={item.config.color}
                                  fontSize={16}
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

                          {/* Vertical line and date on hover */}
                          {hoverX !== null && tooltipData && (
                            <g>
                              {/* Vertical line from x-axis to top */}
                              <line
                                x1={hoverX}
                                y1={0}
                                x2={hoverX}
                                y2={dimensions.height - chartMargin.top - chartMargin.bottom}
                                stroke="#7a7a7a"
                                strokeWidth={1}
                                strokeOpacity={0.3}
                              />
                              {/* Date label at tip of line */}
                              <text
                                x={hoverX}
                                y={12}
                                fill="#7a7a7a"
                                fontSize={12}
                                fontWeight={400}
                                fontFamily="Arial"
                                textAnchor="middle"
                              >
                                {tooltipData.timestamp}
                              </text>
                            </g>
                          )}

                          {/* Hover dots at x position for ALL visible lines */}
                          {hoverX !== null && tooltipData && (() => {
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

                              if (hoverTimestamp < tickerData[0].rawTimestamp) return;

                              const index = bisectDate(tickerData, hoverTimestamp, 1);
                              const d0 = tickerData[index - 1];
                              const pointToUse = d0;

                              const value = pointToUse ? pointToUse[ticker] : null;
                              if (value == null || value === undefined) return;

                              const yPos = yScale(value) ?? 0;
                              hoverData.push({ ticker, config, value, yPos });
                            });

                            return hoverData.map((item) => {
                              return (
                                <g key={`hover-dot-${item.ticker}`}>
                                  {/* Outer ring (no animation on hover) */}
                                  <circle
                                    cx={hoverX}
                                    cy={item.yPos}
                                    r={dotOuterRadius}
                                    fill={item.config.color}
                                    fillOpacity={0.7}
                                    stroke="none"
                                  />
                                  {/* Inner dot */}
                                  <circle
                                    cx={hoverX}
                                    cy={item.yPos}
                                    r={dotInnerRadius}
                                    fill={item.config.color}
                                    stroke={item.config.color}
                                  />
                                </g>
                              );
                            });
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

                  <style jsx global>{`
                    @keyframes mini-pulse-dot {
                      0%, 100% {
                        r: ${dotOuterRadius};
                        opacity: 0.7;
                      }
                      50% {
                        r: ${dotPulseRadius};
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

export default MiniLineChart;
