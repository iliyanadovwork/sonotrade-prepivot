'use client';

import * as stylex from "@stylexjs/stylex";
import { useAuth } from "@/lib/context/AuthContext";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { WithdrawalForm } from "@/components/auth/WithdrawalForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TradingCard } from "@/components/TradingCard";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProofKyc } from "@/hooks/useProofKyc";
import { ShieldCheck } from "lucide-react";

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
    padding: "1.5rem 1.25rem",
    boxSizing: "border-box",
    "@media (max-width: 768px)": {
      padding: "0.5rem 1rem 1.5rem 1rem",
      maxWidth: "100%",
      overflowX: "hidden",
    },
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: 600,
    color: "#fafafa",
    marginTop: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
  },
  portfolioBox: {
    backgroundColor: "transparent",
    padding: 0,
    marginBottom: "3rem",
    "@media (max-width: 768px)": {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  },
  portfolioNumber: {
    fontSize: "3rem",
    fontWeight: 600,
    color: "#22c55e",
    marginBottom: "1.5rem",
    textAlign: "left",
    "@media (max-width: 768px)": {
      textAlign: "center",
      marginTop: "1rem",
    },
  },
  statsGrid: {
    display: "flex",
    gap: "2.5rem",
    "@media (max-width: 768px)": {
      justifyContent: "center",
    },
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.5rem",
    "@media (max-width: 768px)": {
      alignItems: "center",
    },
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#7a7a7a",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    "@media (max-width: 768px)": {
      textAlign: "center",
    },
  },
  statValue: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#fafafa",
    "@media (max-width: 768px)": {
      textAlign: "center",
    },
  },
  actionButtons: {
    display: "flex",
    gap: "1rem",
  },
  actionButton: {
    padding: "0.5rem 1rem",
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
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderColor: "#262626",
    },
    ":active": {
      transform: "scale(0.95)",
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
  tabsContainer: {
    marginBottom: "1rem",
  },
  tabs: {
    display: "flex",
    gap: "1.5rem",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
  },
  tab: {
    paddingBottom: "0.75rem",
    paddingLeft: "0.25rem",
    paddingRight: "0.25rem",
    fontSize: "0.9375rem",
    fontWeight: 500,
    color: "#7a7a7a",
    cursor: "pointer",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
    transition: "color 0.2s, border-color 0.2s",
    ":hover": {
      color: "#a3a3a3",
    },
  },
  tabActive: {
    color: "#ffffff",
    borderBottomColor: "#ffffff",
  },
  tabContent: {
    minHeight: "200px",
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 0",
    color: "#7a7a7a",
    fontSize: "0.9375rem",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
  positionsTable: {
    width: "100%",
    borderCollapse: "collapse",
    "@media (max-width: 768px)": {
      minWidth: "1000px",
    },
  },
  titleRow: {
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "#262626",
  },
  titleCell: {
    padding: "1rem 0",
    fontSize: "0.9375rem",
    fontWeight: 600,
    color: "#fafafa",
    textAlign: "left",
    "@media (max-width: 768px)": {
      paddingBottom: "0.5rem",
    },
  },
  titleContent: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    ":hover": {
      opacity: 0.8,
    },
  },
  titleText: {
    lineHeight: 1,
  },
  eventImage: {
    width: "48px",
    height: "48px",
    borderRadius: "0.375rem",
    objectFit: "cover",
    backgroundColor: "#262626",
    flexShrink: 0,
  },
  eventImagePlaceholder: {
    width: "48px",
    height: "48px",
    borderRadius: "0.375rem",
    backgroundColor: "#000000",
    borderWidth: "0.5px",
    borderStyle: "solid",
    borderColor: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
    overflow: "hidden",
  },
  placeholderAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "26px",
    height: "26px",
  },
  dataRow: {
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
  },
  dataCell: {
    padding: "0.75rem 0 0.75rem 0",
    fontSize: "0.875rem",
    color: "#a3a3a3",
    textAlign: "left",
    verticalAlign: "middle",
  },
  positionBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  positionYes: {
    backgroundColor: "rgba(34, 218, 255, 0.1)",
    color: "#22DAFF",
  },
  positionNo: {
    backgroundColor: "rgba(205, 7, 104, 0.1)",
    color: "#CD0768",
  },
  valueCell: {
    padding: "0.75rem 0 0.75rem 0",
    fontSize: "0.9375rem",
    fontWeight: 600,
    color: "#22c55e",
    textAlign: "right",
    verticalAlign: "middle",
  },
  payoutCell: {
    padding: "0.75rem 1rem 0.75rem 0",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#a3a3a3",
    textAlign: "center",
    verticalAlign: "middle",
    "@media (max-width: 768px)": {
      padding: "0.75rem 0.5rem 0.75rem 0",
    },
  },
  payoutCellRight: {
    padding: "0.75rem 0 0.75rem 0",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#a3a3a3",
    textAlign: "right",
    verticalAlign: "middle",
  },
  headerRow: {
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
  },
  headerCell: {
    padding: "0 0 0.75rem 0",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#7a7a7a",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "left",
    verticalAlign: "middle",
  },
  headerCellRight: {
    padding: "0 0 0.75rem 0",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#7a7a7a",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "right",
    verticalAlign: "middle",
  },
  headerCellCenter: {
    padding: "0 1rem 0.75rem 0",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#7a7a7a",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "center",
    verticalAlign: "middle",
    "@media (max-width: 768px)": {
      padding: "0 0.5rem 0.75rem 0",
    },
  },
  headerCellCenterTight: {
    padding: "0 0.25rem 0.75rem 0",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#7a7a7a",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "center",
    verticalAlign: "middle",
  },
  dataCellCenter: {
    padding: "0.75rem 1rem 0.75rem 0",
    fontSize: "0.875rem",
    color: "#a3a3a3",
    textAlign: "center",
    verticalAlign: "middle",
    "@media (max-width: 768px)": {
      padding: "0.75rem 0.5rem 0.75rem 0",
    },
  },
  dataCellCenterTight: {
    padding: "0.75rem 0.25rem 0.75rem 0",
    fontSize: "0.875rem",
    color: "#a3a3a3",
    textAlign: "center",
    verticalAlign: "middle",
  },
  valueCellCenter: {
    padding: "0.75rem 1rem 0.75rem 0",
    fontSize: "0.9375rem",
    fontWeight: 600,
    color: "#22c55e",
    textAlign: "center",
    verticalAlign: "middle",
    "@media (max-width: 768px)": {
      padding: "0.75rem 0.5rem 0.75rem 0",
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem 0",
  },
  kycBanner: {
    backgroundColor: "transparent",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#262626",
    borderRadius: "0.5rem",
    padding: "1rem 1.5rem",
    marginBottom: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    "@media (max-width: 768px)": {
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "1rem",
    },
  },
  kycBannerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  kycBannerIcon: {
    flexShrink: 0,
    color: "#ffffff",
  },
  kycBannerContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  kycBannerTitle: {
    fontSize: "0.9375rem",
    fontWeight: 600,
    color: "#ffffff",
  },
  kycBannerDescription: {
    fontSize: "0.875rem",
    color: "#a3a3a3",
  },
  kycVerifyButton: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "#ffffff",
    color: "#000000",
    borderWidth: "0px",
    ":hover": {
      backgroundColor: "#e6e6e6",
    },
    ":active": {
      transform: "scale(0.95)",
    },
    "@media (max-width: 768px)": {
      width: "100%",
    },
  },
});

export default function Portfolio() {
  const { user, wallet, isAuthenticated, isLoading, invalidateCache, refreshBalance, refreshPositions, showAuthModal } = useAuth();
  const router = useRouter();
  const { initiateKyc, isChecking, checkKycStatus } = useProofKyc();
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  const [showKycDialog, setShowKycDialog] = useState(false);
  const [kycVerified, setKycVerified] = useState<boolean | null>(null); // null = not checked yet
  const [positions, setPositions] = useState<any[]>([]);
  const [displayedPositions, setDisplayedPositions] = useState<any[]>([]);
  const [positionsPage, setPositionsPage] = useState(1);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [savedEventImages, setSavedEventImages] = useState<Record<string, string>>({});
  const [savedEventTitles, setSavedEventTitles] = useState<Record<string, string>>({});
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [isClosingDeposit, setIsClosingDeposit] = useState(false);
  const [isClosingWithdraw, setIsClosingWithdraw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [redeemingPositions, setRedeemingPositions] = useState<Record<string, boolean>>({});
  const [redeemableStatus, setRedeemableStatus] = useState<Record<string, boolean>>({});
  const [trades, setTrades] = useState<any[]>([]);
  const [displayedTrades, setDisplayedTrades] = useState<any[]>([]);
  const [tradesPage, setTradesPage] = useState(1);
  const [tradesLoading, setTradesLoading] = useState(false);
  const [isTradingDialogOpen, setIsTradingDialogOpen] = useState(false);
  const [selectedPositionForTrading, setSelectedPositionForTrading] = useState<any>(null);
  const POSITIONS_PER_PAGE = 10;
  const TRADES_PER_PAGE = 20;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check KYC status on mount (silently in background)
  useEffect(() => {
    if (isAuthenticated && user) {
      // Only check if we haven't checked recently (within last 5 minutes)
      const lastChecked = user.kycCheckedAt ? new Date(user.kycCheckedAt).getTime() : 0;
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

      if (lastChecked < fiveMinutesAgo) {
        checkKycStatus()
          .then((isVerified) => {
            // Store the result from /api/kyc/status directly
            setKycVerified(isVerified);
          })
          .catch(() => {
            // On error, default to showing KYC prompt
            setKycVerified(false);
          });
      } else {
        // Use cached status from user context
        setKycVerified(user.isKycVerified ?? false);
      }
    }
    // Only run once on mount or when auth status changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Show KYC dialog only after initial status check completes AND user is not verified
  useEffect(() => {
    if (!isLoading && isAuthenticated && kycVerified === false) {
      setShowKycDialog(true);
    } else if (kycVerified === true) {
      // Close dialog if user becomes verified
      setShowKycDialog(false);
    }
  }, [isLoading, isAuthenticated, kycVerified]);

  // Close trading dialog when auth modal opens
  useEffect(() => {
    if (showAuthModal && isTradingDialogOpen) {
      setIsTradingDialogOpen(false);
    }
  }, [showAuthModal, isTradingDialogOpen]);

  // Fetch user positions when positions tab is selected
  useEffect(() => {
    const fetchPositions = async () => {
      if (activeTab !== 'positions' || !isAuthenticated) {
        return;
      }

      try {
        setPositionsLoading(true);
        const result = await apiClient.getPositions();

        if (result.success && result.positions) {
          // Separate active and losing positions
          const activePositions = result.positions.filter((position: any) => {
            if (!position.market) return true;
            const isMarketFinalized = position.market.status === 'determined' || position.market.status === 'finalized';
            if (isMarketFinalized && !position.isRedeemable) {
              return false; // Losing positions
            }
            return true; // Active positions
          });

          const losingPositions = result.positions.filter((position: any) => {
            if (!position.market) return false;
            const isMarketFinalized = position.market.status === 'determined' || position.market.status === 'finalized';
            return isMarketFinalized && !position.isRedeemable;
          });

          // Fetch last trade price only for active positions
          const activePositionsWithPrices = await Promise.all(
            activePositions.map(async (position: any) => {
              if (!position.market?.ticker) return position;

              try {
                const tradesResult = await apiClient.getTrades({
                  ticker: position.market.ticker,
                  limit: 1,
                });

                if (
                  tradesResult.success &&
                  tradesResult.trades &&
                  typeof tradesResult.trades === 'object' &&
                  !Array.isArray(tradesResult.trades) &&
                  'trades' in tradesResult.trades &&
                  Array.isArray((tradesResult.trades as any).trades) &&
                  (tradesResult.trades as any).trades.length > 0
                ) {
                  const lastTrade = (tradesResult.trades as any).trades[0];
                  // Store the price based on position type
                  const currentPrice =
                    position.position === 'YES'
                      ? parseFloat(lastTrade.yesPriceDollars || '0')
                      : parseFloat(lastTrade.noPriceDollars || '0');

                  return {
                    ...position,
                    currentPrice,
                  };
                }
              } catch (err) {
                console.error(`Failed to fetch last trade for ${position.market.ticker}:`, err);
              }

              return position;
            })
          );

          // Combine active positions with prices and losing positions (with value $0)
          // Losing positions are included for portfolio value calculation but won't be displayed
          const allPositions = [...activePositionsWithPrices, ...losingPositions.map(p => ({ ...p, currentPrice: 0 }))];
          setPositions(allPositions);

          // Fetch event metadata only for active positions' unique eventTickers
          const uniqueEventTickers = [...new Set(
            activePositions
              .map((p: any) => p.market?.eventTicker)
              .filter(Boolean)
          )];

          // Fetch saved event images and titles from MongoDB
          const savedEventsPromises = uniqueEventTickers.map(async (eventTicker: string) => {
            try {
              const savedEventResult = await apiClient.checkEventExists(eventTicker);
              if (savedEventResult.success && savedEventResult.event) {
                return {
                  eventTicker,
                  imageUrl: savedEventResult.event.imageUrl,
                  title: savedEventResult.event.title
                };
              }
            } catch (err) {
              console.error(`Failed to fetch saved event for ${eventTicker}:`, err);
            }
            return null;
          });

          const savedEventsResults = await Promise.all(savedEventsPromises);
          const savedImagesMap: Record<string, string> = {};
          const savedTitlesMap: Record<string, string> = {};
          savedEventsResults.forEach((result) => {
            if (result) {
              if (result.imageUrl) {
                savedImagesMap[result.eventTicker] = result.imageUrl;
              }
              if (result.title) {
                savedTitlesMap[result.eventTicker] = result.title;
              }
            }
          });

          setSavedEventImages(savedImagesMap);
          setSavedEventTitles(savedTitlesMap);
        }
      } catch (err) {
        console.error('Failed to fetch positions:', err);
      } finally {
        setPositionsLoading(false);
      }
    };

    fetchPositions();
  }, [activeTab, isAuthenticated]);

  // Fetch user trades when history tab is selected
  useEffect(() => {
    const fetchTrades = async () => {
      if (activeTab !== 'history' || !isAuthenticated) {
        return;
      }

      try {
        setTradesLoading(true);
        const result = await apiClient.getUserTrades();

        if (result.success && result.trades) {
          setTrades(result.trades);

          // Fetch saved event images and titles for trades
          const uniqueEventTickers = [...new Set(
            result.trades
              .map((t: any) => t.eventTicker)
              .filter(Boolean)
          )];

          const savedEventsPromises = uniqueEventTickers.map(async (eventTicker: string) => {
            try {
              const savedEventResult = await apiClient.checkEventExists(eventTicker);
              if (savedEventResult.success && savedEventResult.event) {
                return {
                  eventTicker,
                  imageUrl: savedEventResult.event.imageUrl,
                  title: savedEventResult.event.title
                };
              }
            } catch (err) {
              console.error(`Failed to fetch saved event for ${eventTicker}:`, err);
            }
            return null;
          });

          const savedEventsResults = await Promise.all(savedEventsPromises);
          const savedImagesMap: Record<string, string> = {};
          const savedTitlesMap: Record<string, string> = {};
          savedEventsResults.forEach((result) => {
            if (result) {
              if (result.imageUrl) {
                savedImagesMap[result.eventTicker] = result.imageUrl;
              }
              if (result.title) {
                savedTitlesMap[result.eventTicker] = result.title;
              }
            }
          });

          setSavedEventImages(prev => ({ ...prev, ...savedImagesMap }));
          setSavedEventTitles(prev => ({ ...prev, ...savedTitlesMap }));
        }
      } catch (err) {
        console.error('Failed to fetch trades:', err);
      } finally {
        setTradesLoading(false);
      }
    };

    fetchTrades();
  }, [activeTab, isAuthenticated]);

  // Reset image errors when new images are loaded from MongoDB
  useEffect(() => {
    if (Object.keys(savedEventImages).length > 0) {
      // Reset image errors for events that now have valid imageUrls
      setImageError(prev => {
        const newErrors = { ...prev };
        Object.keys(savedEventImages).forEach(eventTicker => {
          // Reset error for this event so it can try loading the new image
          delete newErrors[eventTicker];
        });
        return newErrors;
      });
    }
  }, [savedEventImages]);

  // Set redeemable status and check for losing positions
  useEffect(() => {
    const statusMap: Record<string, boolean> = {};
    positions.forEach(position => {
      if (position.isRedeemable) {
        statusMap[position.mint] = true;
      }
    });
    setRedeemableStatus(statusMap);
  }, [positions]);

  // Paginate positions display
  useEffect(() => {
    const endIndex = positionsPage * POSITIONS_PER_PAGE;
    setDisplayedPositions(positions.slice(0, endIndex));
  }, [positions, positionsPage]);

  // Paginate trades display
  useEffect(() => {
    const endIndex = tradesPage * TRADES_PER_PAGE;
    setDisplayedTrades(trades.slice(0, endIndex));
  }, [trades, tradesPage]);

  // Reset pagination when switching tabs
  useEffect(() => {
    setPositionsPage(1);
    setTradesPage(1);
  }, [activeTab]);

  // Infinite scroll for positions and trades
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight - scrollTop - clientHeight < 500) {
        if (activeTab === 'positions' && displayedPositions.length < positions.length) {
          setPositionsPage(prev => prev + 1);
        } else if (activeTab === 'history' && displayedTrades.length < trades.length) {
          setTradesPage(prev => prev + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, displayedPositions.length, positions.length, displayedTrades.length, trades.length]);

  // Handle closing deposit modal with fade-out
  const handleCloseDeposit = () => {
    setIsClosingDeposit(true);
    setTimeout(() => {
      setShowDeposit(false);
      setIsClosingDeposit(false);
    }, 200);
  };

  // Handle closing withdraw modal with fade-out
  const handleCloseWithdraw = () => {
    setIsClosingWithdraw(true);
    setTimeout(() => {
      setShowWithdraw(false);
      setIsClosingWithdraw(false);
    }, 200);
  };

  // Handle opening sell dialog
  const handleSell = async (position: any) => {
    let eventImage: string | undefined = savedEventImages[position.market.eventTicker];

    // Fetch saved event image from database if not already loaded
    if (!eventImage) {
      try {
        const savedEventResult = await apiClient.checkEventExists(position.market.eventTicker);
        if (savedEventResult.success && savedEventResult.event?.imageUrl) {
          eventImage = savedEventResult.event.imageUrl;
        }
      } catch (err) {
        console.error('Failed to fetch saved event image:', err);
      }
    }

    // Fetch full event data with fresh bid/ask prices and market accounts
    try {
      const eventResult = await apiClient.getMarketEvent(position.market.eventTicker, true, true);
      if (eventResult.success && eventResult.data) {
        // Find the specific market within the event
        const market = eventResult.data.markets?.find((m: any) => m.ticker === position.market.ticker);

        if (market) {

          // Update position with full market data including fresh bid/ask and image
          setSelectedPositionForTrading({
            ...position,
            market: market,
            imageUrl: eventImage
          });
        } else {
          console.warn('⚠️ Market not found in event, using original data');
          setSelectedPositionForTrading({
            ...position,
            imageUrl: eventImage
          });
        }
      } else {
        console.warn('⚠️ Failed to fetch event data, using original market data');
        setSelectedPositionForTrading({
          ...position,
          imageUrl: eventImage
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch event data:', error);
      setSelectedPositionForTrading({
        ...position,
        imageUrl: eventImage
      });
    }

    setIsTradingDialogOpen(true);
  };

  // Handle redemption
  const handleRedeem = async (position: any) => {
    if (!wallet?.publicKey) return;

    setRedeemingPositions((prev) => ({ ...prev, [position.mint]: true }));

    try {
      // Call backend to handle the entire redemption flow
      const redeemResult = await apiClient.redeemPosition({
        mint: position.mint,
        amount: position.balance,
      });

      if (redeemResult.success) {
        // If async trade, poll for status
        if (redeemResult.executionMode === 'async') {
          let attempts = 0;
          const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes

          const pollStatus = async (): Promise<boolean> => {
            try {
              const statusResult = await apiClient.getOrderStatus(redeemResult.signature!);

              if (statusResult.success && statusResult.data) {
                const status = statusResult.data.status;

                if (status === 'confirmed' || status === 'finalized') {
                  return true;
                } else if (status === 'failed') {
                  throw new Error('Redemption transaction failed');
                }
              }

              attempts++;
              if (attempts >= maxAttempts) {
                throw new Error('Redemption confirmation timeout. Please check your wallet.');
              }

              // Wait 2 seconds before polling again
              await new Promise(resolve => setTimeout(resolve, 2000));
              return pollStatus();
            } catch (err) {
              throw err;
            }
          };

          await pollStatus();
        }

        alert(`Successfully redeemed ${position.balance} tokens!`);
        // Invalidate cache and refresh data
        invalidateCache();
        await refreshBalance(true);
        await refreshPositions(true);
      } else {
        throw new Error(redeemResult.error || "Redemption failed");
      }
    } catch (err) {
      console.error("Redemption error:", err);
      alert("Unable to redeem tokens. Please try again.");
    } finally {
      setRedeemingPositions((prev) => ({ ...prev, [position.mint]: false }));
    }
  };

  if (isLoading) {
    return (
      <div {...stylex.props(styles.layout)}>
        <main {...stylex.props(styles.mainContent)}>
          <div {...stylex.props(styles.contentWrapper)}>
            <div {...stylex.props(styles.emptyState)}>Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !user || !wallet) {
    return null;
  }

  const cashBalance = wallet.balance?.usdc || 0;

  // Calculate total position value
  const totalPositionsValue = positions.reduce((sum, position) => {
    if (!position.market || position.currentPrice === undefined) return sum;
    return sum + (position.balance * position.currentPrice);
  }, 0);

  const portfolioValue = cashBalance + totalPositionsValue;

  return (
    <div {...stylex.props(styles.layout)}>
      <main {...stylex.props(styles.mainContent)}>
        <div {...stylex.props(styles.contentWrapper)}>
          {/* Header with Title and Action Buttons */}
          <h1 {...stylex.props(styles.pageTitle)}>
            <span>Portfolio</span>
            <div {...stylex.props(styles.actionButtons)}>
              <button {...stylex.props(styles.actionButton)} onClick={() => setShowDeposit(true)}>
                Deposit
              </button>
              <button {...stylex.props(styles.actionButton)} onClick={() => setShowWithdraw(true)}>
                Withdraw
              </button>
            </div>
          </h1>

          {/* KYC Verification Banner - only show after status check completes */}
          {kycVerified === false && (
            <div {...stylex.props(styles.kycBanner)}>
              <div {...stylex.props(styles.kycBannerLeft)}>
                <div {...stylex.props(styles.kycBannerIcon)}>
                  <ShieldCheck size={40} strokeWidth={1.5} />
                </div>
                <div {...stylex.props(styles.kycBannerContent)}>
                  <div {...stylex.props(styles.kycBannerTitle)}>
                    KYC Verification Required
                  </div>
                  <div {...stylex.props(styles.kycBannerDescription)}>
                    Complete identity verification to start trading.
                  </div>
                </div>
              </div>
              <button
                {...stylex.props(styles.kycVerifyButton)}
                onClick={initiateKyc}
                disabled={isChecking}
              >
                {isChecking ? 'Loading...' : 'Verify Identity'}
              </button>
            </div>
          )}

          {/* Portfolio Box */}
          <div {...stylex.props(styles.portfolioBox)}>
            <div {...stylex.props(styles.portfolioNumber)}>
              ${portfolioValue.toFixed(2)}
            </div>

            <div {...stylex.props(styles.statsGrid)}>
              <div {...stylex.props(styles.statItem)}>
                <div {...stylex.props(styles.statLabel)}>Positions</div>
                <div {...stylex.props(styles.statValue)}>
                  ${totalPositionsValue.toFixed(2)}
                </div>
              </div>
              <div {...stylex.props(styles.statItem)}>
                <div {...stylex.props(styles.statLabel)}>Cash</div>
                <div {...stylex.props(styles.statValue)}>
                  ${cashBalance.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div {...stylex.props(styles.tabsContainer)}>
            <div {...stylex.props(styles.tabs)}>
              <div
                {...stylex.props(styles.tab, activeTab === 'positions' && styles.tabActive)}
                onClick={() => setActiveTab('positions')}
              >
                Positions
              </div>
              <div
                {...stylex.props(styles.tab, activeTab === 'history' && styles.tabActive)}
                onClick={() => setActiveTab('history')}
              >
                History
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div {...stylex.props(styles.tabContent)}>
            {activeTab === 'positions' && (
              <div className="flex flex-col">
                {positionsLoading ? (
                  <div {...stylex.props(styles.emptyState)}>
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
                          transform: scale(0.95);
                        }
                        50% {
                          opacity: 1;
                          transform: scale(1.05);
                        }
                      }
                    `}</style>
                  </div>
                ) : (() => {
                  // Filter out losing positions
                  const visiblePositions = displayedPositions.filter(position => {
                    if (!position.market) return true;
                    const isMarketFinalized = position.market.status === 'determined' || position.market.status === 'finalized';
                    if (isMarketFinalized && !position.isRedeemable) {
                      return false;
                    }
                    return true;
                  });

                  if (visiblePositions.length === 0 && positions.length === 0) {
                    return (
                      <div {...stylex.props(styles.emptyState)}>
                        You have no open positions
                      </div>
                    );
                  }

                  return (
                  <>
                  <div {...stylex.props(styles.tableWrapper)}>
                    <table {...stylex.props(styles.positionsTable)}>
                    <thead>
                      <tr {...stylex.props(styles.headerRow)}>
                        <th {...stylex.props(styles.headerCell)}>Market</th>
                        <th {...stylex.props(styles.headerCellCenter)}>Shares</th>
                        <th {...stylex.props(styles.headerCellCenterTight)}>Price</th>
                        <th {...stylex.props(styles.headerCellCenter)}>Position Value</th>
                        <th {...stylex.props(styles.headerCellCenter)}>Payout if Win</th>
                        <th {...stylex.props(styles.headerCellRight)}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedPositions
                        .filter(position => {
                          // Filter out losing positions from determined/finalized markets
                          if (!position.market) return true;
                          const isMarketFinalized = position.market.status === 'determined' || position.market.status === 'finalized';
                          if (isMarketFinalized && !position.isRedeemable) {
                            return false; // Hide losing positions
                          }
                          return true; // Show active positions and winning positions
                        })
                        .map((position, idx) => {
                        if (!position.market) return null;

                        const market = position.market;

                        // Use fetched current price (in dollars) or fallback to market bid
                        const currentPrice = position.currentPrice !== undefined
                          ? position.currentPrice
                          : position.position === 'YES'
                          ? parseFloat(market.yesBid || '0')
                          : parseFloat(market.noBid || '0');

                        // Current value = number of shares × current price (in dollars)
                        const currentValue = position.balance * currentPrice;

                        // Use saved MongoDB imageUrl or null (will show placeholder)
                        const eventImage = savedEventImages[market.eventTicker] || null;

                        return (
                          <React.Fragment key={`${position.mint}-${idx}`}>
                            {/* Title Row */}
                            <tr {...stylex.props(styles.titleRow)}>
                              <td {...stylex.props(styles.titleCell)} colSpan={5}>
                                <Link
                                  href={`/events/${market.eventTicker}`}
                                  style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                                >
                                  <div {...stylex.props(styles.titleContent)}>
                                    {eventImage && !imageError[market.eventTicker] ? (
                                      <img
                                        src={eventImage}
                                        alt={market.title}
                                        {...stylex.props(styles.eventImage)}
                                        onError={() => {
                                          console.error('❌ Position image failed to load:', {
                                            eventTicker: market.eventTicker,
                                            imageUrl: eventImage
                                          });
                                          setImageError(prev => ({ ...prev, [market.eventTicker]: true }));
                                        }}
                                      />
                                    ) : (
                                      <div {...stylex.props(styles.eventImagePlaceholder)}>
                                        <div
                                          {...stylex.props(styles.placeholderAccent)}
                                          style={{
                                            background: 'radial-gradient(circle at bottom right, transparent 26px, #fafafa 26px)'
                                          }}
                                        />
                                        <Image
                                          src="/st-glyph.png"
                                          alt="Sonotrade"
                                          width={24}
                                          height={24}
                                          style={{ width: 'auto', height: '24px', objectFit: 'contain', position: 'relative', zIndex: 1 }}
                                        />
                                      </div>
                                    )}
                                    <span {...stylex.props(styles.titleText)}>{market.title}</span>
                                  </div>
                                </Link>
                              </td>
                            </tr>
                            {/* Data Row */}
                            <tr {...stylex.props(styles.dataRow)}>
                              {/* Subtitle with Position badge */}
                              <td {...stylex.props(styles.dataCell)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span>{market.subtitle || '--'}</span>
                                  <span {...stylex.props(
                                    styles.positionBadge,
                                    position.position === 'YES' ? styles.positionYes : styles.positionNo
                                  )}>
                                    {position.position}
                                  </span>
                                </div>
                              </td>
                              {/* Number of shares */}
                              <td {...stylex.props(styles.dataCellCenter)}>
                                {Math.floor(position.balance)} shares
                              </td>
                              {/* Current price */}
                              <td {...stylex.props(styles.dataCellCenterTight)}>
                                {Math.round(currentPrice * 100)}¢
                              </td>
                              {/* Position value */}
                              <td {...stylex.props(styles.valueCellCenter)}>
                                ${currentValue.toFixed(2)}
                              </td>
                              {/* Payout if win */}
                              <td {...stylex.props(styles.payoutCell)}>
                                ${Math.floor(position.balance).toFixed(2)}
                              </td>
                              {/* Action - Redeem or Sell button */}
                              <td {...stylex.props(styles.payoutCellRight)}>
                                {redeemableStatus[position.mint] ? (
                                  <button
                                    {...stylex.props(styles.actionButton)}
                                    onClick={() => handleRedeem(position)}
                                    disabled={redeemingPositions[position.mint]}
                                    style={{
                                      opacity: redeemingPositions[position.mint] ? 0.5 : 1,
                                      cursor: redeemingPositions[position.mint] ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    {redeemingPositions[position.mint] ? 'Redeeming...' : 'Redeem'}
                                  </button>
                                ) : position.market?.status === 'active' ? (
                                  <button
                                    {...stylex.props(styles.actionButton)}
                                    onClick={() => handleSell(position)}
                                  >
                                    Sell
                                  </button>
                                ) : null}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                  {displayedPositions.length < positions.length && (
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
                  );
                })()}
              </div>
            )}
            {activeTab === 'history' && (
              <div className="flex flex-col">
                {tradesLoading ? (
                  <div {...stylex.props(styles.emptyState)}>
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
                ) : trades.length === 0 ? (
                  <div {...stylex.props(styles.emptyState)}>
                    No transaction history
                  </div>
                ) : (() => {
                  // Group trades by eventTicker
                  const tradesByEvent = displayedTrades.reduce((acc: Record<string, any[]>, trade) => {
                    const eventTicker = trade.eventTicker || 'unknown';
                    if (!acc[eventTicker]) {
                      acc[eventTicker] = [];
                    }
                    acc[eventTicker].push(trade);
                    return acc;
                  }, {});

                  return (
                    <>
                      <div {...stylex.props(styles.tableWrapper)}>
                        <table {...stylex.props(styles.positionsTable)}>
                          <thead>
                            <tr {...stylex.props(styles.headerRow)}>
                              <th {...stylex.props(styles.headerCell)}>Market</th>
                              <th {...stylex.props(styles.headerCellCenter)}>Type</th>
                              <th {...stylex.props(styles.headerCellCenter)}>Shares</th>
                              <th {...stylex.props(styles.headerCellCenter)}>Price</th>
                              <th {...stylex.props(styles.headerCellCenter)}>Amount</th>
                              <th {...stylex.props(styles.headerCellCenter)}>Fee</th>
                              <th {...stylex.props(styles.headerCellCenter)}>Total</th>
                              <th {...stylex.props(styles.headerCellRight)}>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(tradesByEvent).map(([eventTicker, eventTrades]) => {
                              const firstTrade = eventTrades[0];
                              // Prioritize eventTitle from trade data, then saved titles, then eventTicker
                              const eventTitle = firstTrade.eventTitle || savedEventTitles[eventTicker] || eventTicker;
                              const eventImage = savedEventImages[eventTicker] || null;

                              return (
                                <React.Fragment key={eventTicker}>
                                  {/* Title Row */}
                                  <tr {...stylex.props(styles.titleRow)}>
                                    <td {...stylex.props(styles.titleCell)} colSpan={8}>
                                      <Link
                                        href={`/events/${eventTicker}`}
                                        style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                                      >
                                        <div {...stylex.props(styles.titleContent)}>
                                          {eventImage && !imageError[eventTicker] ? (
                                            <img
                                              src={eventImage}
                                              alt={eventTitle}
                                              {...stylex.props(styles.eventImage)}
                                              onError={() => {
                                                console.error('❌ History image failed to load:', {
                                                  eventTicker,
                                                  imageUrl: eventImage
                                                });
                                                setImageError(prev => ({ ...prev, [eventTicker]: true }));
                                              }}
                                            />
                                          ) : (
                                            <div {...stylex.props(styles.eventImagePlaceholder)}>
                                              <div
                                                {...stylex.props(styles.placeholderAccent)}
                                                style={{
                                                  background: 'radial-gradient(circle at bottom right, transparent 26px, #fafafa 26px)'
                                                }}
                                              />
                                              <Image
                                                src="/st-glyph.png"
                                                alt="Sonotrade"
                                                width={24}
                                                height={24}
                                                style={{ width: 'auto', height: '24px', objectFit: 'contain', position: 'relative', zIndex: 1 }}
                                              />
                                            </div>
                                          )}
                                          <span {...stylex.props(styles.titleText)}>{eventTitle}</span>
                                        </div>
                                      </Link>
                                    </td>
                                  </tr>
                                  {/* Data Rows for each trade */}
                                  {eventTrades.map((trade, idx) => {
                                    const tradeDate = new Date(trade.timestamp || trade.createdAt);
                                    const formattedDate = tradeDate.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    });

                                    return (
                                      <tr key={trade._id || idx} {...stylex.props(styles.dataRow)}>
                                        {/* Market Title */}
                                        <td {...stylex.props(styles.dataCell)}>
                                          {trade.marketTitle || trade.ticker}
                                        </td>
                                        {/* Side and Outcome */}
                                        <td {...stylex.props(styles.dataCellCenter)}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                            <span style={{
                                              color: trade.side === 'buy' ? '#22c55e' : '#ef4444',
                                              textTransform: 'capitalize'
                                            }}>
                                              {trade.side}
                                            </span>
                                            <span {...stylex.props(
                                              styles.positionBadge,
                                              trade.outcome === 'yes' ? styles.positionYes : styles.positionNo
                                            )}>
                                              {trade.outcome.toUpperCase()}
                                            </span>
                                          </div>
                                        </td>
                                        {/* Shares */}
                                        <td {...stylex.props(styles.dataCellCenter)}>
                                          {Math.floor(trade.shares)} shares
                                        </td>
                                        {/* Price */}
                                        <td {...stylex.props(styles.dataCellCenter)}>
                                          {Math.round(trade.price * 100)}¢
                                        </td>
                                        {/* Amount (shares × price) */}
                                        <td {...stylex.props(styles.dataCellCenter)}>
                                          ${(trade.shares * trade.price).toFixed(2)}
                                        </td>
                                        {/* Fee */}
                                        <td {...stylex.props(styles.dataCellCenter)}>
                                          ${(trade.fee || 0).toFixed(2)}
                                        </td>
                                        {/* Total Amount */}
                                        <td {...stylex.props(styles.valueCellCenter)}>
                                          ${trade.amount.toFixed(2)}
                                        </td>
                                        {/* Date */}
                                        <td {...stylex.props(styles.payoutCellRight)}>
                                          {formattedDate}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {displayedTrades.length < trades.length && (
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
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Deposit Modal */}
      {showDeposit && (
        <div
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${
            isClosingDeposit ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-200'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseDeposit();
            }
          }}
        >
          <div
            className={`w-full max-w-md ${
              isClosingDeposit ? 'animate-out fade-out zoom-out-95 duration-200' : 'animate-in fade-in zoom-in-95 duration-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-md mx-auto bg-[#000000] shadow-lg rounded-lg border border-[rgba(255,255,255,0.1)]">
              <CardHeader className="space-y-1 p-12">
                <CardTitle className="text-2xl font-bold text-center text-white">Deposit USDC</CardTitle>
                <CardDescription className="text-center text-xs md:text-sm text-gray-400">
                  Send USDC to your wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 p-3 bg-[#171717] border border-[rgba(255,255,255,0.1)] rounded-md">
                      <span className="text-sm font-mono text-white flex-1 break-all">
                        {wallet?.publicKey}
                      </span>
                      <Button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(wallet?.publicKey || '');
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          } catch (err) {
                            console.error('Failed to copy:', err);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="px-3 py-1 text-xs bg-[#262626] hover:bg-[#333333] border border-[rgba(255,255,255,0.1)] text-white rounded transition-all whitespace-nowrap cursor-pointer active:scale-95"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-md">
                    <p className="text-xs text-blue-300">
                      ⓘ Send USDC to this address on the Solana network. Funds should appear in your wallet within a few moments.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handleCloseDeposit}
                      className="flex-1 bg-white hover:bg-gray-100 text-black font-medium px-4 py-2 rounded-md transition-all cursor-pointer active:scale-95"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${
            isClosingWithdraw ? 'animate-out fade-out duration-200' : 'animate-in fade-in duration-200'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseWithdraw();
            }
          }}
        >
          <div
            className={`w-full max-w-md ${
              isClosingWithdraw ? 'animate-out fade-out zoom-out-95 duration-200' : 'animate-in fade-in zoom-in-95 duration-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <WithdrawalForm onClose={handleCloseWithdraw} />
          </div>
        </div>
      )}

      {/* Trading Dialog for Selling Positions */}
      <Dialog open={isTradingDialogOpen} onOpenChange={setIsTradingDialogOpen}>
        <DialogContent className="max-w-[100vw] md:max-w-sm w-full overflow-y-auto p-0 bg-transparent border-0">
          <DialogTitle className="sr-only">
            Sell {selectedPositionForTrading?.market?.title || 'Position'}
          </DialogTitle>
          {selectedPositionForTrading && selectedPositionForTrading.market && (
            <TradingCard
              event={{
                ticker: selectedPositionForTrading.market.eventTicker,
                title: selectedPositionForTrading.market.title,
                imageUrl: selectedPositionForTrading.imageUrl,
              }}
              market={selectedPositionForTrading.market}
              eventTitle={selectedPositionForTrading.market.title}
              selectedOutcome={selectedPositionForTrading.position === 'YES' ? 'yes' : 'no'}
              orderType="sell"
              imageUrl={selectedPositionForTrading.imageUrl || undefined}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* KYC Verification Dialog */}
      <Dialog open={showKycDialog} onOpenChange={setShowKycDialog}>
        <DialogContent className="max-w-md p-0 bg-transparent border-0">
          <DialogTitle className="sr-only">
            KYC Verification Required
          </DialogTitle>
          <Card className="w-full max-w-md mx-auto bg-[#000000] shadow-lg rounded-lg border border-[rgba(255,255,255,0.1)]">
            <CardHeader className="space-y-1 px-4 py-6">
              <div className="flex justify-center mb-2">
                <ShieldCheck size={48} strokeWidth={1.5} className="text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-center text-white">
                KYC Verification Required
              </CardTitle>
              <CardDescription className="text-center text-xs md:text-sm" style={{ color: '#7a7a7a' }}>
                Complete identity verification to start trading.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-md">
                  <p className="text-xs text-blue-300">
                    ⓘ You'll be redirected to Proof to complete a quick identity verification. This is required to comply with regulations.
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowKycDialog(false);
                      initiateKyc();
                    }}
                    disabled={isChecking}
                    className="w-full bg-white hover:bg-gray-100 text-black font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isChecking ? 'Loading...' : 'Verify Identity'}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setShowKycDialog(false)}
                    variant="outline"
                    className="w-full bg-transparent hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}
