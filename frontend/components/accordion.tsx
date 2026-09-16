"use client"

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as stylex from "@stylexjs/stylex";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/Tabs";
import { ChevronDown, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { FillAsk } from "@/components/FillAsk";
import { FillBid } from "@/components/FillBid";
import { Badge } from "@/components/Badge";

const styles = stylex.create({
  accordionItem: {
    borderTopWidth: "0px",
    borderTopStyle: "solid",
    borderTopColor: "#262626",
    borderBottomWidth: "0px",
  },
  accordionItemFirst: {
    borderTopWidth: "0px",
  },
  accordionItemLast: {
    borderBottomWidth: "0px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
  },
  accordionHeader: {
    display: "flex",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    ":hover": {
      cursor: "pointer",
    },
    
  },
  triggerMoreMarkets: {
    height: "100%",
    paddingLeft: "0rem",
    paddingRight: "0.25rem",
    "@media (min-width: 640px)": {
      paddingLeft: "0",
      paddingRight: "0.25rem",
    },
    width: "100%",
    display: "flex",
    flex: "1",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "0.75rem",
    paddingBottom: "0.75rem",
    transitionProperty: "background-color",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
    ":hover": {
      backgroundColor: "#080808",
    },
  },
  triggerDefault: {
    height: "100%",
    paddingLeft: "0",
    paddingRight: "0rem",
    width: "100%",
    display: "flex",
    flex: "1",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "0.75rem",
    paddingBottom: "0.75rem",
    fontWeight: 500,
    transitionProperty: "background-color",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease",
    flexDirection: "column",
    gap: "0.25rem",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
    ":hover": {
      backgroundColor: "#080808",
    },
    "@media (min-width: 640px)": {
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    "@media (min-width: 768px)": {
      flexDirection: "row",
      gap: "0rem",
    },
  },
  finalizedMarketTrigger: {
    height: "100%",
    paddingLeft: "0",
    paddingRight: "0.25rem",
    width: "100%",
    display: "flex",
    flex: "1",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "0.75rem",
    paddingBottom: "0.75rem",
    fontWeight: 500,
    transitionProperty: "background-color",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
    ":hover": {
      backgroundColor: "#080808",
    },
    "@media (min-width: 640px)": {
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
  },
  mobileLayout: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingRight: "0.5rem",
    "@media (min-width: 768px)": {
      display: "none",
    },
  },
  mobileLeft: {
    display: "flex",
    alignItems: "center",
    paddingRight: "0",
    gap: "0.75rem",
  },
  marketImage: {
    width: "48px",
    height: "48px",
    borderRadius: "0.375rem",
    objectFit: "cover",
    flexShrink: "0",
  },
  textWhite: {
    color: "white",
  },
  volumeColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    height: "100%",
    gap: "0.25rem",
  },
  titleText: {
    fontSize: "14px",
    "@media (min-width: 640px)": {
      fontSize: "0.875rem",
    },
    "@media (min-width: 1024px)": {
      fontSize: "0.875rem",
    },
    textAlign: "left",
    color: "white",
  },
  volumeText: {
    fontSize: "12px",
    "@media (min-width: 640px)": {
      fontSize: "0.8125rem",
    },
    color: "#7a7a7a",
    textAlign: "left",
  },
  mobileRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flexShrink: "0",
  },
  oddsText: {
    fontSize: "1.5rem",
    textAlign: "center",
    fontWeight: 600,
    color: "white",
  },
  chevronIcon: {
    height: "16px",
    width: "16px",
    color: "#9ca3af",
    transitionProperty: "transform",
    transitionDuration: "200ms",
    flexShrink: "0",
  },
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  desktopLayout: {
    display: "none",
    "@media (min-width: 768px)": {
      display: "flex",
    },
    alignItems: "center",
    
  },
  desktopLeft: {
    display: "flex",
    alignItems: "center",
    paddingRight: "1rem",
    "@media (min-width: 640px)": {
      paddingRight: "1.5rem",
    },
    minWidth: "480px",
    gap: "1rem",
  },
  desktopTextColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    height: "100%",
    minWidth: "0",
    gap: "0.25rem",
  },
  desktopTitleText: {
    fontSize: "13px",
    "@media (min-width: 640px)": {
      fontSize: "14px",
    },
    textAlign: "left",
    wordBreak: "break-word",
    whiteSpace: "normal",
    lineHeight: "1.375",
    color: "white",
  },
  desktopVolumeText: {
    fontSize: "12px",
    "@media (min-width: 640px)": {
      fontSize: "13px",
    },
    color: "#7a7a7a",
    textAlign: "left",
  },
  desktopOddsColumn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: "60px",
    paddingLeft: "0.25rem",
    paddingRight: "0.5rem",
  },
  mobileButtons: {
    display: "flex",
    "@media (min-width: 768px)": {
      display: "none",
    },
    alignItems: "center",
    gap: "0.625rem",
    width: "100%",
    paddingTop: "0.5rem",
  },
  desktopButtons: {
    display: "none",
    "@media (min-width: 768px)": {
      display: "flex",
    },
    alignItems: "center",
    gap: "0.625rem",
    paddingRight: "0.5rem",
    minWidth: "300px",
  },
  buttonGroup: {
    position: "relative",
    width: "100%",
    "@media (min-width: 768px)": {
      width: "auto",
    },
  },
  button: {
    width: "100%",
    "@media (min-width: 768px)": {
      width: "140px",
      height: "40px",
    },
    height: "44px",
    paddingTop: "0.25rem",
    paddingBottom: "0.25rem",
    borderRadius: "0.375rem",
    position: "relative",
    zIndex: "10",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    whiteSpace: "nowrap",
    fontSize: "0.875rem",
    fontWeight: 500,
    transitionProperty: "opacity, transform, border-color",
    transitionDuration: "300ms",
    cursor: "pointer",
    "@media (max-width: 768px)": {
      ":hover": {
        transform: "scale(0.95)",
      },
      ":active": {
        transform: "scale(0.9)",
      },
    },
  },
  buttonYes: {
    backgroundColor: "transparent",
    color: "#22DAFF",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#262626",
    ":hover": {
      opacity: 0.8,
      borderColor: "rgba(255, 255, 255, 0.42)",
    },
  },
  buttonYesActive: {
    backgroundColor: "transparent",
    color: "#22DAFF",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#22DAFF",
    ":hover": {
      opacity: 0.8,
    },
  },
  buttonNo: {
    backgroundColor: "transparent",
    color: "#CD0768",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#262626",
    ":hover": {
      opacity: 0.8,
      borderColor: "rgba(255, 255, 255, 0.42)",
    },
  },
  buttonNoActive: {
    backgroundColor: "transparent",
    color: "#CD0768",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "#CD0768",
    ":hover": {
      opacity: 0.8,
    },
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
  },
  buttonPriceText: {
    marginLeft: "0.25rem",
    fontSize: "1.25rem",
  },
  moreMarketsLabel: {
    display: "flex",
    alignItems: "center",
  },
  moreMarketsText: {
    fontSize: "13px",
    "@media (min-width: 640px)": {
      fontSize: "14px",
    },
    color: "white",
    fontWeight: 500,
  },
  accordionContent: {
    overflow: "hidden",
    fontSize: "0.875rem",
  },
  contentInner: {
    paddingBottom: "1rem",
  },
  tabsContainer: {
    width: "100%",
  },
  mobileTabsContainer: {
    display: "inline-flex",
    gap: "1rem",
    paddingLeft: "0rem",
    paddingRight: "1rem",
    paddingTop: "0.75rem",
    paddingBottom: "0rem",
    "@media (min-width: 768px)": {
      display: "none",
    },
  },
  mobileTab: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    paddingLeft: "0rem",
    paddingRight: "0rem",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 150ms",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
  },
  mobileTabInactive: {
    borderBottomColor: "transparent",
    color: "#7a7a7a",
  },
  mobileTabActive: {
    borderBottomColor: "white",
    color: "white",
  },
  spreadText: {
    "@media (max-width: 768px)": {
      gridColumn: "span 2 / span 2",
    },
  },
});

// Selection context type and context (restored)
interface SelectionContextType {
  activeMarket: string | null;
  activeSelection: string | null;
  activeOrderbook: any | null;
  setSelection: (marketId: string | null, value: string | null, orderbook?: any) => void;
  // New: requestOpen lets triggers ask the page to open a specific market (page controls accordion state)
  requestOpen?: (marketId: string) => void;
  // Callback to notify parent of selection changes
  onSelectionChange?: (marketId: string | null, selection: string | null) => void;
}

const SelectionContext = React.createContext<SelectionContextType>({
  activeMarket: null,
  activeSelection: null,
  activeOrderbook: null,
  setSelection: () => {},
  requestOpen: () => {},
  onSelectionChange: () => {},
});

// Provide selection context to Accordion triggers and content
const SelectionProvider: React.FC<{
  children: React.ReactNode;
  requestOpen?: (marketId: string) => void;
  onSelectionChange?: (marketId: string | null, selection: string | null) => void;
  externalSelection?: 'yes' | 'no' | null;
}> = ({ children, requestOpen, onSelectionChange, externalSelection }) => {
  const [activeMarket, setActiveMarket] = React.useState<string | null>(null);
  const [activeSelection, setActiveSelection] = React.useState<string | null>(null);
  const [activeOrderbook, setActiveOrderbook] = React.useState<any | null>(null);

  // Sync external selection changes (from TradingCard) back to context
  React.useEffect(() => {
    if (externalSelection !== undefined && externalSelection !== activeSelection) {
      setActiveSelection(externalSelection);
    }
  }, [externalSelection]);

  const setSelection = React.useCallback((marketId: string | null, value: string | null, orderbook?: any) => {
    setActiveMarket(marketId);
    setActiveSelection(value);
    setActiveOrderbook(orderbook ?? null);
    // Notify parent component of selection change
    if (onSelectionChange) {
      onSelectionChange(marketId, value);
    }
  }, [onSelectionChange]);

  return (
    <SelectionContext.Provider value={{ activeMarket, activeSelection, activeOrderbook, setSelection, requestOpen, onSelectionChange }}>
      {children}
    </SelectionContext.Provider>
  );
};

type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & { children?: React.ReactNode };

// Accept an optional onRequestOpen prop so page can pass a handler that controls accordion state
const Accordion: React.FC<AccordionProps & { 
  onRequestOpen?: (marketId: string) => void;
  onSelectionChange?: (marketId: string | null, selection: string | null) => void;
  externalSelection?: 'yes' | 'no' | null;
}> = ({ children, onRequestOpen, onSelectionChange, externalSelection, ...props }) => {
  return (
    <SelectionProvider requestOpen={onRequestOpen} onSelectionChange={onSelectionChange} externalSelection={externalSelection}>
      <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
    </SelectionProvider>
  );
};

interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  className?: string;
}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    {...stylex.props(styles.accordionItem)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const useSelection = (): SelectionContextType => {
  const context = React.useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
};

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  className?: string;
  marketId: string;
  outcomePrice?: number;
  setSelectedOrderBookData: (orderBook: any) => void;
  orderBook: any;
  setSelectedIndex: (index: number) => void;
  index: number;
  isMultiMarket?: boolean;
  setIsDrawerOpen?: (open: boolean) => void;
  setActiveView?: (view: string) => void;
  volume?: number;
  outcome0Title?: string; // First outcome title (e.g., "Up")
  outcome1Title?: string; // Second outcome title (e.g., "Down")
  onDecreaseMoreMarkets?: () => void; // Callback for decreasing "More markets" count
  marketImageUrl?: string; // Image URL from Kalshi metadata
  yesAsk?: string; // Yes ask price from market data (for buying)
  noAsk?: string; // No ask price from market data (for buying)
  yesBid?: string; // Yes bid price from market data (for selling)
  noBid?: string; // No bid price from market data (for selling)
  orderType?: 'buy' | 'sell'; // Whether to show ask (buy) or bid (sell) prices
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(
  (
    {
      className,
      children,
      marketId,
      outcomePrice,
      setSelectedOrderBookData,
      orderBook,
      setSelectedIndex,
      index,
      isMultiMarket,
      setIsDrawerOpen,
      setActiveView,
      volume,
      outcome0Title = "Yes",
      outcome1Title = "No",
      marketImageUrl,
      yesAsk,
      noAsk,
      yesBid,
      noBid,
      orderType = 'buy',
      onDecreaseMoreMarkets,
      ...props
    },
    ref
  ) => {
    const { activeMarket, activeSelection, setSelection, requestOpen } = useSelection();
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const hasAutoSelectedRef = React.useRef(false);

    // Track accordion open/closed state
    React.useEffect(() => {
      const checkState = () => {
        if (triggerRef.current) {
          const state = triggerRef.current.getAttribute("data-state");
          const newIsOpen = state === "open";
          setIsOpen(newIsOpen);

          // Reset auto-select flag when accordion closes
          if (!newIsOpen) {
            hasAutoSelectedRef.current = false;
          }
        }
      };

      // Check immediately
      checkState();

      // Set up a MutationObserver to watch for data-state changes
      if (triggerRef.current) {
        const observer = new MutationObserver(checkState);
        observer.observe(triggerRef.current, {
          attributes: true,
          attributeFilter: ['data-state']
        });

        return () => observer.disconnect();
      }
    }, []);

    // Auto-select "yes" when accordion opens for this market
    React.useEffect(() => {
      if (isOpen && activeMarket !== marketId && !hasAutoSelectedRef.current) {
        // Accordion just opened and this market isn't already active, select "yes" by default
        setSelection(marketId, "yes", orderBook);
        setSelectedOrderBookData(orderBook);
        setSelectedIndex(index);
        hasAutoSelectedRef.current = true;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, marketId, activeMarket, setSelection]);

    const descending = (a: any, b: any): number => Number(b[0]) - Number(a[0]);

    const parsePriceString = (s: string | undefined) => {
      if (!s) return null;
      const cleaned = String(s).replace('¢', '').trim();
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : null;
    };

    const firstPriceFromRows = (rows: any[]) => {
      if (!Array.isArray(rows) || rows.length === 0) return null;
      // rows use price like '11.00¢' (yes price in cents)
      const p = parsePriceString(rows[0].price);
      return p;
    };

    const firstPriceFromObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return null;
      const keys = Object.keys(obj).map(k => Number(k)).filter(Number.isFinite).sort((a,b) => b - a);
      if (keys.length === 0) return null;
      // keys are decimals like 0.11, convert to cents
      return keys[0] * 100;
    };

    const calculateYesPrice = () => {
      // prefer UI rows shape
      const yesFromRows = firstPriceFromRows(orderBook?.asks || orderBook?.data?.asks);
      if (yesFromRows !== null) return Number(yesFromRows.toFixed(2));
      // fallback to object shape
      const yesFromObj = firstPriceFromObject(orderBook?.asks || orderBook?.data?.asks || orderBook?.no_bids);
      return yesFromObj !== null ? Number(yesFromObj.toFixed(2)) : null;
    };

    const calculateNoPrice = () => {
      const noFromRows = firstPriceFromRows(orderBook?.bids || orderBook?.data?.bids);
      if (noFromRows !== null) return Number(noFromRows.toFixed(2));
      const noFromObj = firstPriceFromObject(orderBook?.bids || orderBook?.data?.bids || orderBook?.yes_bids);
      return noFromObj !== null ? Number(noFromObj.toFixed(2)) : null;
    };

    const yesPrice = calculateYesPrice();
    const noPrice = calculateNoPrice();

    // Button prices use market data
    // For buy: show ask prices (what you pay to buy)
    // For sell: show bid prices (what you get when selling)
    const leftButtonPercent = orderType === 'buy' 
      ? (yesAsk ? Math.round(parseFloat(yesAsk) * 100) : null)
      : (yesBid ? Math.round(parseFloat(yesBid) * 100) : null);
      
    const rightButtonPercent = orderType === 'buy'
      ? (noAsk ? Math.round(parseFloat(noAsk) * 100) : null)
      : (noBid ? Math.round(parseFloat(noBid) * 100) : null);

    const handleSelection = (value: string, e?: React.MouseEvent) => {
      // NOTE: do not call e.stopPropagation() here so Radix can receive trigger clicks.
      setSelectedOrderBookData(orderBook);
      setSelectedIndex(index);

      // Case 1: Clicking the same button in the same market - keep it selected, don't deactivate
      if (activeMarket === marketId && activeSelection === value) {
        // Don't deactivate, keep the selection
        return;
      }

      // Case 2: Switching from yes to no or vice versa in the same market - update selection
      if (activeMarket === marketId && activeSelection !== value) {
        setSelection(marketId, value, orderBook);
        return;
      }

      // Case 3: Selecting a button in a different market - set selection
      setSelection(marketId, value, orderBook);
    };

    const isActive = activeMarket === marketId;

    return (
      <AccordionPrimitive.Header {...stylex.props(styles.accordionHeader)}>
        <AccordionPrimitive.Trigger
          asChild
          ref={(node) => {
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<any>).current = node;
            triggerRef.current = node;
          }}
          {...props}
        >
          {
            // Special thin "More markets" trigger: no vol, no percent, no Yes/No buttons
            (() => {
              const isMore = String(marketId) === 'more-markets' || String(marketId).startsWith('more-markets');
              // Do not attach a click handler on the trigger wrapper — let Radix handle trigger clicks.
              // Buttons still call requestOpen(...) when they need the page to open the accordion.

              if (isMore) {
                const moreLabel = Array.isArray(children) ? children[0] : 'More markets';
                const lessLabel = Array.isArray(children) ? children[1] : 'Show less';
                const hasAllShown = Array.isArray(children) ? children[2] : false;

                // When closed: show "More markets"
                // When open and NOT all shown: show "More markets" on left, "Show less" on right
                // When open and all shown: show only "Show less" in center

                if (!isOpen) {
                  // Closed state: show "More markets"
                  return (
                    <div
                      {...stylex.props(styles.triggerMoreMarkets)}
                      data-market-id={'more-markets'}
                    >
                      <div {...stylex.props(styles.moreMarketsLabel)}>
                        <span {...stylex.props(styles.moreMarketsText)}>{moreLabel}</span>
                      </div>
                    </div>
                  );
                } else if (hasAllShown) {
                  // Open and all shown: show only "Show less" in center
                  return (
                    <div
                      {...stylex.props(styles.triggerMoreMarkets)}
                      data-market-id={'more-markets'}
                    >
                      <div {...stylex.props(styles.moreMarketsLabel)}>
                        <span {...stylex.props(styles.moreMarketsText)}>{lessLabel}</span>
                      </div>
                    </div>
                  );
                } else {
                  // Open but not all shown: show both buttons
                  return (
                    <div
                      {...stylex.props(styles.triggerMoreMarkets)}
                      data-market-id={'more-markets'}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                    >
                      <div {...stylex.props(styles.moreMarketsLabel)}>
                        <span {...stylex.props(styles.moreMarketsText)}>{moreLabel}</span>
                      </div>
                      <div
                        {...stylex.props(styles.moreMarketsLabel)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onDecreaseMoreMarkets) onDecreaseMoreMarkets();
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <span {...stylex.props(styles.moreMarketsText)}>{lessLabel}</span>
                      </div>
                    </div>
                  );
                }
              }

              // Default (existing) layout for normal markets
              return (
                <div
                  {...stylex.props(styles.triggerDefault)}
                  data-market-id={String(marketId)}
                >
                  {/* Mobile layout - single row with title, volume, and odds */}
                  <div {...stylex.props(styles.mobileLayout)}>
                    <div {...stylex.props(styles.mobileLeft)}>
                      {marketImageUrl && (
                        <img
                          src={marketImageUrl}
                          alt=""
                          {...stylex.props(styles.marketImage)}
                        />
                      )}
                      {Array.isArray(children) && children[0] ? (
                        <span {...stylex.props(styles.textWhite)}>{children[0]}</span>
                      ) : null}
                      <span {...stylex.props(styles.volumeColumn)}>
                        { }
                        <span {...stylex.props(styles.titleText)}>
                          {Array.isArray(children) ? children[1] : children}
                        </span>
                        <span {...stylex.props(styles.volumeText)}>
                          Vol ${
                            typeof volume === "number"
                              ? Number(volume).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : "--"
                          }
                        </span>
                      </span>
                    </div>
                    {/* Odds and chevron positioned at the end of the row on mobile */}
                    <div {...stylex.props(styles.mobileRight)}>
                      <span {...stylex.props(styles.oddsText)} style={outcomePrice === undefined ? { color: '#7a7a7a' } : undefined}>
                        {outcomePrice !== undefined ? Math.round(outcomePrice) + "%" : "--%"}
                      </span>
                      <ChevronDown {...stylex.props(styles.chevronIcon, isOpen && styles.chevronOpen)} aria-hidden="true" />
                    </div>
                  </div>

                  {/* Mobile buttons row - shown only on mobile below the main info */}
                  <div {...stylex.props(styles.mobileButtons)}>
                    <div {...stylex.props(styles.buttonGroup)}>
                      <button
                        type="button"
                        {...stylex.props(
                          styles.button,
                          isOpen && isActive && activeSelection === 'yes' ? styles.buttonYesActive : styles.buttonYes
                        )}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelection("yes", e);
                          if (!isOpen && requestOpen) {
                            requestOpen(String(marketId));
                          }
                          if (setIsDrawerOpen && setActiveView && window.innerWidth < 768) {
                            setActiveView(outcome0Title);
                            setIsDrawerOpen(true);
                          }
                        }}
                      >
                        <span {...stylex.props(styles.buttonContent)}>
                          <span>Yes</span>
                          {leftButtonPercent !== null && (
                            <span {...stylex.props(styles.buttonPriceText)}>{leftButtonPercent}¢</span>
                          )}
                        </span>
                      </button>
                    </div>
                    <div {...stylex.props(styles.buttonGroup)}>
                      <button
                        type="button"
                        {...stylex.props(
                          styles.button,
                          isOpen && isActive && activeSelection === 'no' ? styles.buttonNoActive : styles.buttonNo
                        )}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelection("no", e);
                          if (!isOpen && requestOpen) {
                            requestOpen(String(marketId));
                          }
                          if (setIsDrawerOpen && setActiveView && window.innerWidth < 768) {
                            setActiveView(outcome1Title);
                            setIsDrawerOpen(true);
                          }
                        }}
                      >
                        <span {...stylex.props(styles.buttonContent)}>
                          <span>No</span>
                          {rightButtonPercent !== null && (
                            <span {...stylex.props(styles.buttonPriceText)}>{rightButtonPercent}¢</span>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop layout - matches header structure exactly */}
                  <div {...stylex.props(styles.desktopLayout)}>
                    <div {...stylex.props(styles.desktopLeft)}>
                       {marketImageUrl && (
                         <img
                           src={marketImageUrl}
                           alt=""
                           {...stylex.props(styles.marketImage)}
                         />
                       )}
                       {Array.isArray(children) && children[0] ? (
                         <span {...stylex.props(styles.textWhite)}>{children[0]}</span>
                       ) : null}
                       <span {...stylex.props(styles.desktopTextColumn)}>
                         <span {...stylex.props(styles.desktopTitleText)}>
                           {Array.isArray(children) ? children[1] : children}
                         </span>
                         <span {...stylex.props(styles.desktopVolumeText)}>
                           Vol ${
                             typeof volume === "number"
                               ? Number(volume).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                               : "--"
                           }
                         </span>
                       </span>
                     </div>
                    {/* Odds value at the end, just before the buttons */}
                    <div {...stylex.props(styles.desktopOddsColumn)}>
                       <span {...stylex.props(styles.oddsText)} style={outcomePrice === undefined ? { color: '#7a7a7a' } : undefined}>
                         {outcomePrice !== undefined ? Math.round(outcomePrice) + "%" : "--%"}
                       </span>
                     </div>
                   </div>

                   {/* Desktop buttons - hidden on mobile to match header */}
                   <div {...stylex.props(styles.desktopButtons)} style={{ minWidth: 300 }}>
                     {/* Yes/No buttons to the right of the odds */}
                     <div {...stylex.props(styles.buttonGroup)}>
                        <button
                          type="button"
                          {...stylex.props(
                            styles.button,
                            isOpen && isActive && activeSelection === 'yes' ? styles.buttonYesActive : styles.buttonYes
                          )}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Just handle selection, don't call requestOpen to avoid closing accordion
                            handleSelection("yes", e);
                            // Only open accordion if it's not already open
                            if (!isOpen && requestOpen) {
                              requestOpen(String(marketId));
                            }
                            // Open drawer on mobile for both single and multi markets
                            if (setIsDrawerOpen && setActiveView && window.innerWidth < 768) {
                              setActiveView(outcome0Title);
                              setIsDrawerOpen(true);
                            }
                          }}
                        >
                          <span {...stylex.props(styles.buttonContent)}>
                            <span>Yes</span>
                            {leftButtonPercent !== null && (
                              <span {...stylex.props(styles.buttonPriceText)}>{leftButtonPercent}¢</span>
                            )}
                          </span>
                        </button>
                      </div>
                      <div {...stylex.props(styles.buttonGroup)}>
                        <button
                          type="button"
                          {...stylex.props(
                            styles.button,
                            isOpen && isActive && activeSelection === 'no' ? styles.buttonNoActive : styles.buttonNo
                          )}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Just handle selection, don't call requestOpen to avoid closing accordion
                            handleSelection("no", e);
                            // Only open accordion if it's not already open
                            if (!isOpen && requestOpen) {
                              requestOpen(String(marketId));
                            }
                            // Open drawer on mobile for both single and multi markets
                            if (setIsDrawerOpen && setActiveView && window.innerWidth < 768) {
                              setActiveView(outcome1Title);
                              setIsDrawerOpen(true);
                            }
                          }}
                        >
                          <span {...stylex.props(styles.buttonContent)}>
                            <span>No</span>
                            {rightButtonPercent !== null && (
                              <span {...stylex.props(styles.buttonPriceText)}>{rightButtonPercent}¢</span>
                            )}
                          </span>
                        </button>

                      </div>
                      {/* Chevron at end of buttons inside the flex container - rotates when open */}
                      <ChevronDown {...stylex.props(styles.chevronIcon, isOpen && styles.chevronOpen)} aria-hidden="true" />
                    </div>
                </div>
              );
            })()
          }
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  }
);

AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  className?: string;
  marketId: string;
  orderBook?: any; // optional orderbook passed from parent
}

const AccordionContent = React.forwardRef<any, AccordionContentProps>(({ className, children, marketId, orderBook, ...props }, ref) => {
   const { activeMarket, activeSelection, activeOrderbook, setSelection } = useSelection();
   const isActive = activeMarket === marketId;
   const selection = isActive ? activeSelection : null;

   // Prefer orderBook passed via props (from page) — falls back to context activeOrderbook set by user selection
   const effectiveOrderbook = orderBook ?? activeOrderbook;

   // Track changed rows for flash animation
   const [flashingRows, setFlashingRows] = useState<Set<string>>(new Set());
   const prevOrderbookRef = useRef<any>(null);

   // Detect orderbook changes and trigger flash animation
   useEffect(() => {
     if (!effectiveOrderbook || !prevOrderbookRef.current) {
       prevOrderbookRef.current = effectiveOrderbook;
       return;
     }

     const prev = prevOrderbookRef.current;
     const curr = effectiveOrderbook;

     const changedRowKeys = new Set<string>();

     // When selection is 'no', the orderbook is flipped
     const isNoSelected = selection === 'no';

     if (isNoSelected) {
       // For "No" view: yes_bids become asks, no_bids become bids
       // The transform swaps them and applies complementary prices

       // Check asks (yes_bids from WebSocket becomes asks when flipped)
       const prevYesBids = prev.yes_bids || {};
       const currYesBids = curr.yes_bids || {};

       Object.keys(currYesBids).forEach((price) => {
         const prevQty = prevYesBids[price];
         const currQty = currYesBids[price];

         if (prevQty !== undefined && currQty !== undefined && prevQty !== currQty) {
           const yesBidPrice = Number(price);
           const askPrice = 1 - yesBidPrice; // Complementary price
           changedRowKeys.add(`ask-${askPrice}`);
         }
       });

       // Check bids (no_bids from WebSocket becomes bids when flipped)
       // no_bids are converted (1 - price), then swapped to bids, then converted again (1 - price)
       // This results in the original no_bid price being displayed
       const prevNoBids = prev.no_bids || {};
       const currNoBids = curr.no_bids || {};

       Object.keys(currNoBids).forEach((price) => {
         const prevQty = prevNoBids[price];
         const currQty = currNoBids[price];

         if (prevQty !== undefined && currQty !== undefined && prevQty !== currQty) {
           const noBidPrice = Number(price);
           // No conversion needed - double complementary conversion returns to original price
           changedRowKeys.add(`bid-${noBidPrice}`);
         }
       });
     } else {
       // For "Yes" view (default): no_bids become asks, yes_bids become bids

       // Check asks (no_bids from WebSocket becomes asks after converting to complementary price)
       const prevNoBids = prev.no_bids || {};
       const currNoBids = curr.no_bids || {};

       Object.keys(currNoBids).forEach((price) => {
         const prevQty = prevNoBids[price];
         const currQty = currNoBids[price];

         if (prevQty !== undefined && currQty !== undefined && prevQty !== currQty) {
           const noBidPrice = Number(price);
           const askPrice = 1 - noBidPrice;
           changedRowKeys.add(`ask-${askPrice}`);
         }
       });

       // Check bids (yes_bids from WebSocket becomes bids)
       const prevBids = prev.yes_bids || {};
       const currBids = curr.yes_bids || {};

       Object.keys(currBids).forEach((price) => {
         const prevQty = prevBids[price];
         const currQty = currBids[price];

         if (prevQty !== undefined && currQty !== undefined && prevQty !== currQty) {
           const normalizedPrice = Number(price);
           changedRowKeys.add(`bid-${normalizedPrice}`);
         }
       });
     }

     if (changedRowKeys.size > 0) {
       setFlashingRows(changedRowKeys);

       // Clear flash after animation completes (400ms)
       const timeout = setTimeout(() => {
         setFlashingRows(new Set());
       }, 400);

       return () => clearTimeout(timeout);
     }

     prevOrderbookRef.current = curr;
   }, [effectiveOrderbook]);

   // Transform API orderbook data to table format
   const transformOrderbookData = (orderbook: any, selectedOutcome: string | null = null) => {
     if (!orderbook) {
       return { asks: [], bids: [] };
     }

     // Support cases where the page passed the API response object { success, data }
     const ob = orderbook && typeof orderbook === 'object' && 'data' in orderbook ? orderbook.data : orderbook;

     // Helper: convert orders object -> sorted array of rows with per-row totals
     const toRows = (ordersObj: any) => {
       if (!ordersObj) return [];

       // If it's an array of pairs [[price, size], ...]
       if (Array.isArray(ordersObj)) {
         const parsed = ordersObj
           .map((item) => {
             if (Array.isArray(item) && item.length >= 2) return { price: Number(item[0]) || 0, size: Number(item[1]) || 0 };
             if (item && typeof item === 'object' && ('price' in item || 'p' in item)) return { price: Number(item.price ?? item.p) || 0, size: Number(item.size ?? item.s ?? item.qty ?? item.amount) || 0 };
             return null;
           })
           .filter(Boolean as any)
           .sort((a: any, b: any) => b.price - a.price);
         return parsed.map((r: any) => ({ ...r, rowTotal: r.price * r.size }));
       }

       // If it's an object mapping price->size
       if (typeof ordersObj === 'object') {
         const arr = Object.entries(ordersObj)
           .map(([price, size]) => ({ price: Number(price) || 0, size: Number(size) || 0 }))
           .sort((a: any, b: any) => b.price - a.price);
         return arr.map((r: any) => ({ ...r, rowTotal: r.price * r.size }));
       }

       return [];
     };

    const ordersSource = (() => {
      if (ob && (ob.bids || ob.asks)) {
        return {
          asksObj: ob.asks || {},
          bidsObj: ob.bids || {},
        };
      }

      // Legacy Dflow shape: convert no_bids -> yes-asks and keep yes_bids as bids
      const legacyAsks: Record<string, number> = {};
      const legacyNoBids = ob.no_bids || {};
      for (const [priceStr, amount] of Object.entries(legacyNoBids)) {
        const parsed = parseFloat(priceStr);
        if (!Number.isFinite(parsed)) continue;
        const yesPrice = 1 - parsed;
        const key = yesPrice.toFixed(4);
        const numericAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
        legacyAsks[key] = (legacyAsks[key] || 0) + numericAmount;
      }

      return {
        asksObj: legacyAsks,
        bidsObj: ob.yes_bids || {},
      };
    })();

    // Build raw rows for both sides
    let asksRowsRaw = toRows(ordersSource.asksObj);
    let bidsRowsRaw = toRows(ordersSource.bidsObj);

    // If "No" is selected, flip asks and bids with complementary prices
    if (selectedOutcome === 'no') {
      // Swap asks and bids
      const tempAsks = asksRowsRaw;
      asksRowsRaw = bidsRowsRaw;
      bidsRowsRaw = tempAsks;
      
      // Convert prices to complementary (1 - price)
      asksRowsRaw = asksRowsRaw.map(r => ({
        ...r,
        price: 1 - r.price,
        rowTotal: (1 - r.price) * r.size
      }));
      
      bidsRowsRaw = bidsRowsRaw.map(r => ({
        ...r,
        price: 1 - r.price,
        rowTotal: (1 - r.price) * r.size
      }));
      
      // Re-sort to maintain asks (higher prices) above bids (lower prices)
      asksRowsRaw.sort((a: any, b: any) => b.price - a.price);
      bidsRowsRaw.sort((a: any, b: any) => b.price - a.price);
    }

    // Sum total value (price * contracts) for each side and pick the larger to normalize fills
    const asksSum = asksRowsRaw.reduce((s: number, r: any) => s + (r.rowTotal || 0), 0);
    const bidsSum = bidsRowsRaw.reduce((s: number, r: any) => s + (r.rowTotal || 0), 0);
    const maxSideTotal = Math.max(asksSum, bidsSum, 1); // avoid division by zero

    // Build cumulative totals
    // For asks: cumulative should go all the way up (i.e., cumulative at each row = sum from that row to the end)
    const asksCumulative: number[] = [];
    let acc = 0;
    for (let i = asksRowsRaw.length - 1; i >= 0; i--) {
      acc += asksRowsRaw[i].rowTotal || 0;
      asksCumulative[i] = acc;
    }

    // For bids: cumulative should go all the way down (i.e., running sum from top to bottom)
    const bidsCumulative: number[] = [];
    acc = 0;
    for (let i = 0; i < bidsRowsRaw.length; i++) {
      acc += bidsRowsRaw[i].rowTotal || 0;
      bidsCumulative[i] = acc;
    }

    // Determine highest cumulative across both sides (use total cumulative for each side)
    const asksTotalCumulative = asksCumulative.length > 0 ? asksCumulative[0] : 0;
    const bidsTotalCumulative = bidsCumulative.length > 0 ? bidsCumulative[bidsCumulative.length - 1] : 0;
    const maxCumulativeAcrossSides = Math.max(asksTotalCumulative, bidsTotalCumulative, 1);

    // Helper function to format numbers with commas
    const formatNumber = (num: number, decimals: number = 0): string => {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    };

    // Map to final UI rows: per-row total is the cumulative value as requested, fill percent relative to the highest cumulative across sides
    const mapToUiRows = (rowsRaw: any[], cumulativeArr: number[] = []) =>
      rowsRaw.map((r, idx) => {
        const cumulativeValue = (cumulativeArr && cumulativeArr[idx]) || (r.rowTotal || 0);
        const fillPercent = Math.max(0, Math.min(100, (cumulativeValue / maxCumulativeAcrossSides) * 100));
        return {
          fill: Math.round(fillPercent), // numeric 0-100 based on cumulative
          price: (r.price * 100).toFixed(0) + '¢', // no decimal places
          priceNumeric: r.price, // keep numeric value for spread calculation
          contracts: formatNumber(r.size || 0, 0), // whole number with commas
          total: '$' + formatNumber(cumulativeValue, 2), // 2 decimals with commas
        };
      });

    const asksUi = mapToUiRows(asksRowsRaw, asksCumulative);
    const bidsUi = mapToUiRows(bidsRowsRaw, bidsCumulative);

    // Calculate spread: lowest ask price - highest bid price
    const lowestAskPrice = asksUi.length > 0 ? asksUi[asksUi.length - 1].priceNumeric : null;
    const highestBidPrice = bidsUi.length > 0 ? bidsUi[0].priceNumeric : null;
    const spread = (lowestAskPrice !== null && highestBidPrice !== null) 
      ? ((lowestAskPrice - highestBidPrice) * 100).toFixed(1) + '¢'
      : '—';

    return {
      asks: asksUi,
      bids: bidsUi,
      spread: spread,
    };
  };

  const selectedOrderBook = transformOrderbookData(effectiveOrderbook, selection);
  const hasOrderbookData = selectedOrderBook.asks.length > 0 || selectedOrderBook.bids.length > 0;

  // Default outcome titles when not supplied
  const outcome0Title = "Yes";
  const outcome1Title = "No";

  // If this content is for the special "more-markets" trigger, render only children (no messages)
  if (String(marketId).startsWith('more-markets')) {
    return (
      <AccordionPrimitive.Content
        ref={ref}
        className="overflow-hidden"
        {...props}
      >
        <div className="pb-4">
          {children}
        </div>
      </AccordionPrimitive.Content>
    );
  }

  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden"
      {...props}
    >
      <style jsx global>{`
        @keyframes flash-ask {
          0%, 100% { background-color: transparent; }
          50% { background-color: #2e0000; }
        }
        @keyframes flash-bid {
          0%, 100% { background-color: transparent; }
          50% { background-color: #002404; }
        }
      `}</style>
      <div className="pb-0">
        {children}

        {/* Mobile-only tabs for switching between Yes/No orderbook views */}
        <div {...stylex.props(styles.mobileTabsContainer)}>
          <button
            type="button"
            {...stylex.props(
              styles.mobileTab,
              selection === 'yes' ? styles.mobileTabActive : styles.mobileTabInactive
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelection(marketId, 'yes', effectiveOrderbook);
            }}
          >
            Trade Yes
          </button>
          <button
            type="button"
            {...stylex.props(
              styles.mobileTab,
              selection === 'no' ? styles.mobileTabActive : styles.mobileTabInactive
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelection(marketId, 'no', effectiveOrderbook);
            }}
          >
            Trade No
          </button>
        </div>

        {hasOrderbookData ? (
        <div {...stylex.props(styles.tabsContainer)}>
           {/* Single header row for both sides */}
           <div className="grid grid-cols-4 gap-4 pl-3 mt-2 text-[13px] sm:text-[14px] text-white font-medium mb-2">
             <div className="text-left"></div>
             <div className="text-center">Price</div>
             <div className="text-center">Contracts</div>
             <div className="text-right">Total</div>
           </div>

           {/* Fixed-height container with spread row in center */}
           <div className="relative border-b border-[#262626]" style={{ height: '400px' }}>
             {/* Top fade */}
             <div className="absolute top-[-1px] left-0 right-0 h-16 pointer-events-none z-20" style={{ background: 'linear-gradient(to bottom, #000000 0%, transparent 100%)' }}></div>

             {/* Container with asks above and bids below the spread */}
             <div className="relative h-full flex flex-col">
               {/* Asks section - scrollable, grows upward, anchored to spread */}
               <div className="flex-1 overflow-y-auto flex flex-col-reverse" style={{ minHeight: 0 }}>
                 <div className="space-y-1">
                   {selectedOrderBook.asks.length > 0 ? (
                     selectedOrderBook.asks.map((row: any, idx: number) => {
                       const rowKey = `ask-${row.priceNumeric}`;
                       const isFlashing = flashingRows.has(rowKey);

                       return (
                         <div key={`ask-${idx}`} className="relative">
                           <FillAsk value={row.fill} className="absolute inset-0" />
                           <div
                             className={`relative z-10 grid grid-cols-4 items-center pl-3 py-1 text-sm text-white h-7`}
                             style={isFlashing ? {
                               animation: 'flash-ask 400ms ease-in-out',
                               backgroundColor: '#2e0000'
                             } : undefined}
                           >
                             <div className="text-left">{/* label */}</div>
                             <div className="text-center"><span className="text-tron-red" style={{ color: '#ff3b30' }}>{row.price}</span></div>
                             <div className="text-center">{row.contracts}</div>
                             <div className="text-right">{row.total}</div>
                           </div>
                         </div>
                       );
                     })
                   ) : (
                     <div className="text-center text-white text-sm py-4">No asks available</div>
                   )}
                 </div>
               </div>

               {/* Spread row - fixed in center, doesn't move */}
               <div data-spread-row className="bg-[#0f0f0f] grid grid-cols-4 items-center pl-3 py-1 text-sm text-[#7a7a7a] h-7 flex-shrink-0">
                 <div className="text-left"></div>
                 <div className="text-center font-medium" {...stylex.props(styles.spreadText)}>
                   Spread {selectedOrderBook.spread}
                 </div>
                 <div className="text-center"></div>
                 <div className="text-right"></div>
               </div>

               {/* Bids section - scrollable, grows downward, anchored to spread */}
               <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
                 <div className="space-y-1">
                   {selectedOrderBook.bids.length > 0 ? (
                     selectedOrderBook.bids.map((row: any, idx: number) => {
                       const rowKey = `bid-${row.priceNumeric}`;
                       const isFlashing = flashingRows.has(rowKey);
                       return (
                         <div key={`bid-${idx}`} className="relative">
                           <FillBid value={row.fill} className="absolute inset-0" />
                           <div
                             className={`relative z-10 grid grid-cols-4 items-center pl-3 py-1 text-sm text-white h-7`}
                             style={isFlashing ? {
                               animation: 'flash-bid 400ms ease-in-out',
                               backgroundColor: '#002404'
                             } : undefined}
                           >
                             <div className="text-left">{/* label */}</div>
                             <div className="text-center"><span className="text-tron-green" style={{ color: '#00e676' }}>{row.price}</span></div>
                             <div className="text-center">{row.contracts}</div>
                             <div className="text-right">{row.total}</div>
                           </div>
                         </div>
                       );
                     })
                   ) : (
                     <div className="text-center text-white text-sm py-4">No bids available</div>
                   )}
                 </div>
               </div>
             </div>

             {/* Bottom fade */}
             <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-20" style={{ background: 'linear-gradient(to top, #000000 0%, transparent 100%)' }}></div>
           </div>
         </div>
       ) : null}
      </div>
     </AccordionPrimitive.Content>
   );
 });

 AccordionContent.displayName = "AccordionContent";

// Export the components so other files can import them by name
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, styles as accordionStyles };

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger
          marketId="1"
          outcomePrice={75}
          setSelectedOrderBookData={() => { }}
          orderBook={{}}
          setSelectedIndex={() => { }}
          index={0}
          isMultiMarket={false}
          setIsDrawerOpen={() => { }}
          setActiveView={() => { }}
          volume={10000}
        >
          {["Market 1", "75%"]}
        </AccordionTrigger>
        <AccordionContent marketId="1">
          Content for Market 1
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger
          marketId="2"
          outcomePrice={25}
          setSelectedOrderBookData={() => { }}
          orderBook={{}}
          setSelectedIndex={() => { }}
          index={1}
          isMultiMarket={false}
          setIsDrawerOpen={() => { }}
          setActiveView={() => { }}
          volume={5000}
        >
          {["Market 2", "25%"]}
        </AccordionTrigger>
        <AccordionContent marketId="2">
          Content for Market 2
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
