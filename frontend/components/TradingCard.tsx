import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/api/client";
import { STButton } from "@/components/STButton";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

interface TradingCardProps {
  event?: any;
  market?: any;
  eventTitle?: string;
  selectedOutcome?: 'yes' | 'no' | null;
  imageUrl?: string;
  orderType?: 'buy' | 'sell';
  onOrderTypeChange?: (type: 'buy' | 'sell') => void;
  onOutcomeChange?: (outcome: 'yes' | 'no' | null) => void;
}

export function TradingCard({
  event,
  market,
  eventTitle,
  selectedOutcome: externalSelectedOutcome,
  imageUrl,
  orderType: externalOrderType = 'buy',
  onOrderTypeChange,
  onOutcomeChange
}: TradingCardProps) {
  const { wallet, isAuthenticated, refreshBalance, invalidateCache, openAuthModal } = useAuth();
  const [inputMode, setInputMode] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState('');
  const [showInputModeMenu, setShowInputModeMenu] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [quote, setQuote] = useState<{
    contracts: number;
    usdcCost: number;
    platformFee: number;
    totalCost: number;
    payout: number;
  } | null>(null);

  const PLATFORM_FEE = 0.50; // $0.50 platform fee per trade
  const [fetchingQuote, setFetchingQuote] = useState(false);
  const [kalshiMetadata, setKalshiMetadata] = useState<any>(null);
  const [showTradeStatus, setShowTradeStatus] = useState(false);
  const [tradeStatus, setTradeStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const [showNoContractsError, setShowNoContractsError] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isClosingSuccessModal, setIsClosingSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    type: 'buy' | 'sell';
    outcome: 'yes' | 'no';
    contracts: number;
    amount: number;
  } | null>(null);
  const [isGeoblocked, setIsGeoblocked] = useState(false);

  // Use external orderType if provided, otherwise use local state
  const orderType = externalOrderType;
  const setOrderType = onOrderTypeChange || (() => {});

  // Use first market if no specific market provided
  const activeMarket = market || event?.markets?.[0];

  // Check geoblocking status on mount
  useEffect(() => {
    const checkGeoblocking = async () => {
      try {
        const result = await apiClient.checkGeoblock();
        if (result.success && result.blocked) {
          setIsGeoblocked(true);
          console.log('🚫 User is in geoblocked country:', result.countryName);
        }
      } catch (error) {
        console.error('Failed to check geoblocking:', error);
        // On error, allow trading (fail open)
      }
    };
    checkGeoblocking();
  }, []);

  // Sync with external selection from accordion
  useEffect(() => {
    if (externalSelectedOutcome !== undefined) {
      setSelectedOutcome(externalSelectedOutcome);
    }
  }, [externalSelectedOutcome]);

  // Disable body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  // Fetch Kalshi metadata for event-level images
  useEffect(() => {
    const fetchMetadata = async () => {
      if (event?.ticker || activeMarket?.eventTicker) {
        const eventTicker = event?.ticker || activeMarket?.eventTicker;
        try {
          const metadataResult = await apiClient.getEventMetadata(eventTicker);
          if (metadataResult.success && metadataResult.data) {
            setKalshiMetadata(metadataResult.data);
          }
        } catch (error) {
          console.warn('Failed to fetch Kalshi metadata:', error);
        }
      }
    };
    fetchMetadata();
  }, [event?.ticker, activeMarket?.eventTicker]);

  // Fetch user positions when orderType is 'sell'
  useEffect(() => {
    const fetchPositions = async () => {
      if (orderType === 'sell' && isAuthenticated) {
        try {
          const result = await apiClient.getPositions();
          if (result.success && result.positions) {
            setUserPositions(result.positions);
          }
        } catch (error) {
          console.error('Failed to fetch positions:', error);
          setUserPositions([]);
        }
      }
    };
    fetchPositions();
  }, [orderType, isAuthenticated]);

  // Helper to update outcome and notify parent
  const handleOutcomeChange = (outcome: 'yes' | 'no' | null) => {
    setSelectedOutcome(outcome);
    if (onOutcomeChange) {
      onOutcomeChange(outcome);
    }
  };

  // Check if market is finalized/determined
  const isFinalized = activeMarket?.status === 'finalized' || activeMarket?.status === 'determined';

  // Check if market is closed but not yet finalized
  const isClosed = activeMarket?.status === 'closed';

  // Determine which image to use with proper fallback cascade
  // 1. Market-level image (imageUrl prop)
  // 2. If market image is "fallback" or empty → Event-level image from DFlow (event?.imageUrl)
  // 3. If event image is "fallback" or empty → Kalshi metadata image (kalshiMetadata?.image_url)
  // 4. If no valid image found → null (no image shown)
  const finalImageUrl = useMemo(() => {
    const isValid = (url: string) =>
      url && url.trim() !== '' && !url.includes('fallback') && !url.endsWith('.svg');
    if (imageUrl && isValid(imageUrl)) return imageUrl;
    if (event?.imageUrl && isValid(event.imageUrl)) return event.imageUrl;
    if (kalshiMetadata?.image_url && isValid(kalshiMetadata.image_url)) return kalshiMetadata.image_url;
    return null;
  }, [imageUrl, event?.imageUrl, kalshiMetadata?.image_url]);


  // Get yes/no prices based on orderType (buy/sell)
  // For buy: show ask prices (what you pay to buy)
  // For sell: show bid prices (what you get when selling)
  const yesPrice = orderType === 'buy'
    ? (activeMarket?.yesAsk ? Math.round(parseFloat(activeMarket.yesAsk) * 100) : null)
    : (activeMarket?.yesBid ? Math.round(parseFloat(activeMarket.yesBid) * 100) : null);
    
  const noPrice = orderType === 'buy'
    ? (activeMarket?.noAsk ? Math.round(parseFloat(activeMarket.noAsk) * 100) : null)
    : (activeMarket?.noBid ? Math.round(parseFloat(activeMarket.noBid) * 100) : null);

  // Get mint addresses for trading
  const yesMint = activeMarket?.accounts?.[USDC_MINT]?.yesMint;
  const noMint = activeMarket?.accounts?.[USDC_MINT]?.noMint;

  // Check if user has shares for the selected outcome (for sell orders)
  const getUserSharesForOutcome = (outcome: 'yes' | 'no' | null): number => {
    if (!outcome || orderType !== 'sell' || !yesMint || !noMint) return 0;

    const targetMint = outcome === 'yes' ? yesMint : noMint;
    const position = userPositions.find(pos => pos.mint === targetMint);

    return position ? position.balance : 0;
  };

  const userShares = getUserSharesForOutcome(selectedOutcome);
  const hasNoShares = !!(orderType === 'sell' && selectedOutcome && userShares === 0);

  // Check if user has insufficient balance for buy orders
  const hasInsufficientBalance = !!(orderType === 'buy' && quote && wallet?.balance?.usdc !== undefined && wallet.balance.usdc < quote.totalCost);

  // Fetch quote when amount or outcome changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || !selectedOutcome || !yesMint || !noMint) {
        setQuote(null);
        return;
      }

      const numAmount = parseFloat(amount);
      if (numAmount <= 0 || isNaN(numAmount)) {
        setQuote(null);
        return;
      }

      setFetchingQuote(true);
      try {
        const outcomeMint = selectedOutcome === 'yes' ? yesMint : noMint;

        let response;
        if (orderType === 'buy') {
          // Buy: Deduct platform fee before requesting quote
          // User enters $10 → request quote for $9.50 → total cost shown is $10
          const amountAfterFee = Math.max(0, numAmount - PLATFORM_FEE);

          if (amountAfterFee <= 0) {
            setQuote(null);
            setFetchingQuote(false);
            return;
          }

          // Buy: USDC → Outcome tokens (with fee deducted)
          response = await apiClient.getTradeQuote({
            inputMint: USDC_MINT,
            outputMint: outcomeMint,
            amount: Math.floor(amountAfterFee * 1_000_000), // Convert to USDC decimals (after fee)
            predictionMarketSlippageBps: 100,
          });

          if (response.success && response.quote) {
            const contracts = parseFloat(response.quote.outAmount) / 1_000_000;
            const usdcCost = parseFloat(response.quote.inAmount) / 1_000_000;
            const totalCost = usdcCost + PLATFORM_FEE; // Total = quote amount + fee
            const payout = contracts * 1.0;

            setQuote({
              contracts,
              usdcCost,
              platformFee: PLATFORM_FEE,
              totalCost,
              payout,
            });
          }
        } else {
          // Sell: Outcome tokens → USDC
          response = await apiClient.getTradeQuote({
            inputMint: outcomeMint,
            outputMint: USDC_MINT,
            amount: Math.floor(numAmount * 1_000_000), // Convert contracts to decimals
            predictionMarketSlippageBps: 100,
          });

          if (response.success && response.quote) {
            const usdcReceived = parseFloat(response.quote.outAmount) / 1_000_000;
            const contractsSold = parseFloat(response.quote.inAmount) / 1_000_000;
            const totalReceived = usdcReceived - PLATFORM_FEE; // Subtract platform fee

            setQuote({
              contracts: contractsSold,
              usdcCost: usdcReceived,
              platformFee: PLATFORM_FEE,
              totalCost: totalReceived, // For sell, this is what you receive
              payout: totalReceived,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch quote:', error);
        setQuote(null);
      } finally {
        setFetchingQuote(false);
      }
    };

    // Debounce the quote fetch
    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [amount, selectedOutcome, yesMint, noMint, orderType]);

  // Handle closing success modal with fade-out
  const handleCloseSuccessModal = () => {
    setIsClosingSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setIsClosingSuccessModal(false);
      setSuccessDetails(null);
    }, 200); // Match fade-out animation duration
  };

  // Handle trade execution
  const handleTrade = async () => {
    if (!isAuthenticated || !wallet) {
      setTradeStatus({ success: false, message: 'Please sign in to trade' });
      setShowTradeStatus(true);
      return;
    }

    if (!selectedOutcome) {
      setTradeStatus({ success: false, message: 'Please select Yes or No' });
      setShowTradeStatus(true);
      return;
    }

    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      setTradeStatus({ success: false, message: 'Please enter a valid amount' });
      setShowTradeStatus(true);
      return;
    }

    if (!yesMint || !noMint) {
      setTradeStatus({ success: false, message: 'Market mint addresses not found' });
      setShowTradeStatus(true);
      return;
    }

    // Check for no contracts to sell
    if (orderType === 'sell' && hasNoShares) {
      // Trigger red border animation
      setShowNoContractsError(true);
      setTimeout(() => setShowNoContractsError(false), 1000);
      return;
    }

    // Validate quote exists
    if (orderType === 'buy' && !quote) {
      setTradeStatus({ success: false, message: 'Quote not available. Please try again.' });
      setShowTradeStatus(true);
      return;
    }

    // For sell orders, validate shares
    if (orderType === 'sell') {
      // Check if user has enough shares
      if (userShares < numAmount) {
        setShowNoContractsError(true);
        setTimeout(() => setShowNoContractsError(false), 1000);
        return;
      }
    }

    setLoading(true);

    try {
      const outcomeMint = selectedOutcome === 'yes' ? yesMint : noMint;

      if (orderType === 'buy') {
        // Buy: Deduct platform fee before executing trade
        const amountAfterFee = numAmount - PLATFORM_FEE;

        // Buy: USDC → Outcome tokens (with fee deducted)
        await apiClient.executeTrade({
          inputMint: USDC_MINT,
          outputMint: outcomeMint,
          amount: Math.floor(amountAfterFee * 1_000_000), // Convert to USDC decimals (after fee)
          slippageBps: 50,
          ticker: market?.ticker,
          marketTitle: market?.yesSubTitle|| market?.title,
          eventTitle: eventTitle || event?.title,
          eventTicker: market?.eventTicker || event?.ticker,
          side: 'buy',
          outcome: selectedOutcome || 'yes',
          platformFee: PLATFORM_FEE,
        });
      } else {
        // Sell: Outcome tokens → USDC
        await apiClient.executeTrade({
          inputMint: outcomeMint,
          outputMint: USDC_MINT,
          amount: Math.floor(numAmount * 1_000_000), // Convert contracts to decimals
          slippageBps: 50,
          ticker: market?.ticker,
          marketTitle: market?.yesSubTitle || market?.title,
          eventTitle: eventTitle || event?.title,
          eventTicker: market?.eventTicker || event?.ticker,
          side: 'sell',
          outcome: selectedOutcome || 'yes',
          platformFee: 0, // No fee on sells
        });
      }

      // Show success modal with details
      setSuccessDetails({
        type: orderType,
        outcome: selectedOutcome,
        contracts: quote?.contracts || numAmount,
        amount: orderType === 'buy'
          ? (quote?.totalCost || numAmount)
          : ((quote?.usdcCost || 0) - (quote?.platformFee || 0))
      });
      setShowSuccessModal(true);

      // Invalidate cache and refresh data after successful trade
      if (invalidateCache) {
        invalidateCache();
      }
      if (refreshBalance) {
        await refreshBalance(true); // Force refresh
      }

      // Clear form and quote
      setAmount('');
      setSelectedOutcome(null);
      setQuote(null);

    } catch (error: any) {
      console.error('Trade failed:', error);

      // Check if it's a geoblocking error
      const errorMessage = error?.message || '';
      const isGeoblocked = errorMessage.includes('not available in your location') ||
                          errorMessage.includes('geoblocked') ||
                          errorMessage.includes('403');

      setTradeStatus({
        success: false,
        message: isGeoblocked
          ? 'Trading is not available in your location'
          : 'Unable to complete trade. Please try again.'
      });
      setShowTradeStatus(true);
    } finally {
      setLoading(false);
    }
  };

  // Success Modal Component
  const successModal = showSuccessModal && successDetails && typeof document !== 'undefined' && createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2147483647,
        position: 'fixed',
        isolation: 'isolate',
        animation: isClosingSuccessModal ? 'fadeOut 200ms ease-out' : 'fadeIn 200ms ease-out'
      }}
      onClick={handleCloseSuccessModal}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes scaleOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
      `}</style>
      <div
        className="bg-[#000000] border border-[rgba(255,255,255,0.1)] rounded-lg p-6 max-w-md w-full"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          zIndex: 2147483647,
          animation: isClosingSuccessModal
            ? 'scaleOut 200ms cubic-bezier(0.4, 0, 0.2, 1)'
            : 'scaleIn 250ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-[#00e676]/10 p-3">
            <CheckCircle className="w-12 h-12 text-[#00e676]" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white text-center mb-2">
          Order Placed
        </h2>

        {/* Details */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-[#262626]">
            <span className="text-[13px] text-[#a3a3a3]">Type</span>
            <span className="text-[15px] text-white font-medium">
              {successDetails.type === 'buy' ? 'Buy' : 'Sell'}{' '}
              <span style={{ color: successDetails.outcome === 'yes' ? '#22DAFF' : '#CD0768' }}>
                {successDetails.outcome === 'yes' ? 'Yes' : 'No'}
              </span>
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#262626]">
            <span className="text-[13px] text-[#a3a3a3]">Contracts</span>
            <span className="text-[15px] text-white font-medium">
              {Math.floor(successDetails.contracts)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[13px] text-[#a3a3a3]">
              {successDetails.type === 'buy' ? 'Total Cost' : 'Total Received'}
            </span>
            <span className={`text-[15px] font-semibold ${
              successDetails.type === 'sell' && successDetails.amount < 0
                ? 'text-[#ff4444]'
                : 'text-white'
            }`}>
              ${successDetails.amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleCloseSuccessModal}
          className="w-full py-3 px-4 bg-transparent hover:opacity-80 border border-white text-white rounded-md font-medium text-[15px] transition-all duration-150 active:scale-90 cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>,
    document.body
  );

  // Mobile drawer overlay portal
  const mobileDrawerOverlay = isMobileDrawerOpen && typeof document !== 'undefined' && createPortal(
    <div
      className="fixed inset-0 bg-black/60 z-[9999] md:hidden"
      onClick={() => {
        setIsMobileDrawerOpen(false);
        document.getElementById('cost-input')?.blur();
      }}
    />,
    document.body
  );

  return (
    <>
      {successModal}
      {mobileDrawerOverlay}
      <div
        className="bg-[#000000] border-t md:border border-[#262626] rounded-lg p-4 animate-fade-in sticky"
        style={{
          top: '90px',
          maxHeight: 'calc(100vh - 90px)',
          height: 'fit-content',
          boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)',
          zIndex: isMobileDrawerOpen ? 10000 : 1
        }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col relative p-[1px]">
          {/* Header with image and title */}
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex gap-2">
              {finalImageUrl && (
                <div
                  className="flex justify-center items-center w-[56px] min-w-[56px] h-[56px] rounded-lg overflow-hidden"
                  style={{ background: 'transparent', borderRadius: '0.5rem' }}
                >
                  <img
                    key={finalImageUrl}
                    alt={eventTitle || event?.title || 'Event'}
                    src={finalImageUrl}
                    className="w-[56px] h-[56px] object-cover animate-fade-in"
                    style={{ borderRadius: '0.5rem' }}
                  />
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <div>
                  <span className="text-[#a3a3a3] text-[13px] leading-5 font-normal">
                    {eventTitle || event?.title || activeMarket?.title}
                  </span>
                </div>
                <span className="text-white text-[15px] leading-6 font-semibold">
                  {isFinalized ? (
                    <span className="text-[15px] leading-6 font-semibold text-[#a3a3a3]">
                      Market Resolved
                    </span>
                  ) : isClosed ? (
                    <span className="text-[15px] leading-6 font-semibold text-[#a3a3a3]">
                      Market Closed
                    </span>
                  ) : (
                    <>
                      <span
                        className="text-[15px] leading-6 font-semibold"
                        style={{
                          color: selectedOutcome === 'yes' ? '#22DAFF' : selectedOutcome === 'no' ? '#CD0768' : '#a3a3a3'
                        }}
                      >
                        {orderType === 'buy' ? 'Buy' : 'Sell'} {selectedOutcome === 'yes' ? 'Yes' : selectedOutcome === 'no' ? 'No' : '—'}
                      </span>
                      {activeMarket?.yesSubTitle && ` · ${activeMarket.yesSubTitle}`}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Buy/Sell toggle and Dollars/Contracts selector - only show if not finalized and not closed */}
            {!isFinalized && !isClosed && <div className="flex flex-col">
              <div className="flex items-center justify-between box-border">
                {/* Buy/Sell Toggle */}
                <div className="relative max-w-full min-w-0">
                  <div className="overflow-x-auto scrollbar-none w-full">
                    <div className="inline-flex gap-1 flex-nowrap w-full">
                      <button
                        className={`inline-flex items-center h-7 px-3 rounded-full min-w-[28px] whitespace-nowrap box-border shrink-0 cursor-pointer transition-all duration-150 active:scale-90 ${
                          orderType === 'buy'
                            ? 'text-white bg-white/10 border border-white hover:opacity-80'
                            : 'text-white bg-transparent border border-[#3a3a3a] hover:bg-[#1a1a1a]'
                        }`}
                        onClick={() => setOrderType('buy')}
                      >
                        <span className="text-[13px] leading-5 font-medium">Buy</span>
                      </button>
                      <button
                        className={`inline-flex items-center h-7 px-3 rounded-full min-w-[28px] whitespace-nowrap box-border shrink-0 cursor-pointer transition-all duration-150 active:scale-90 ${
                          orderType === 'sell'
                            ? 'text-white bg-white/10 border border-white hover:opacity-80'
                            : 'text-white bg-transparent border border-[#3a3a3a] hover:bg-[#1a1a1a]'
                        }`}
                        onClick={() => setOrderType('sell')}
                      >
                        <span className="text-[13px] leading-5 font-medium">Sell</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Market/Limit Order Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowInputModeMenu(!showInputModeMenu)}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <span className="text-white text-[13px] leading-5 font-medium">
                      {inputMode === 'market' ? 'Market' : 'Limit'}
                    </span>
                    <ChevronDown className="w-5 h-5 text-white" />
                  </button>
                  
                  {showInputModeMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowInputModeMenu(false)}
                      />
                      <div 
                        className="absolute right-0 z-20 mt-1 bg-[#000000] border border-[#262626] rounded-lg shadow-lg min-w-[120px]"
                        style={{
                          animation: 'dropdown-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                          transformOrigin: 'top right'
                        }}
                      >
                        <button
                          onClick={() => {
                            setInputMode('market');
                            setShowInputModeMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-[13px] text-white hover:bg-[#1a1a1a] first:rounded-t-lg"
                        >
                          Market
                        </button>
                        <button
                          disabled
                          className="w-full px-4 py-2 text-left text-[13px] text-[#4a4a4a] cursor-not-allowed last:rounded-b-lg opacity-50"
                        >
                          Limit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Yes/No Price Pills */}
              <div className="flex justify-between items-center flex-grow mt-3 gap-2">
                <div className="flex-1">
                  <STButton
                    variant="outcomeYes"
                    selected={selectedOutcome === "yes"}
                    price={yesPrice !== null ? yesPrice : undefined}
                    fullWidth
                    disabled={yesPrice === null}
                    onClick={() => handleOutcomeChange(selectedOutcome === "yes" ? null : "yes")}
                  >
                    Yes
                  </STButton>
                </div>
                <div className="flex-1">
                  <STButton
                    variant="outcomeNo"
                    selected={selectedOutcome === "no"}
                    price={noPrice !== null ? noPrice : undefined}
                    fullWidth
                    disabled={noPrice === null}
                    onClick={() => handleOutcomeChange(selectedOutcome === "no" ? null : "no")}
                  >
                    No
                  </STButton>
                </div>
              </div>
            </div>}
          </div>

          {/* Order Form - only show if not finalized and not closed */}
          {!isFinalized && !isClosed && <form className="flex flex-col gap-3 h-full flex-grow">
            {/* Amount Input */}
            <div className="animate-fade-in">
              <label
                className="pt-[13px] pb-[13px] transition-all duration-300 max-w-full cursor-text py-1.5 px-4 w-full block box-border text-start border border-solid border-[#3a3a3a] rounded-md outline-0 hover:border-[#4a4a4a] focus-within:!border-white focus-within:!outline-white focus-within:!outline focus-within:!border"
                htmlFor="cost-input"
              >
                <span className="inline-flex items-center justify-between w-full">
                  <div className="flex flex-col w-full">
                    <span className="block flex-shrink-0 pr-1">
                      <div className="flex">
                        <span className="text-white text-[13px] leading-5 font-medium">
                          {orderType === 'buy' ? 'Amount' : 'Contracts'}
                        </span>
                      </div>
                    </span>
                    {orderType === 'buy' ? (
                      <span className="select-none">
                        <span className="text-[#a3a3a3] text-[13px] leading-5 font-medium">
                          Cash: ${wallet?.balance?.usdc?.toFixed(2) || '0.00'}
                        </span>
                      </span>
                    ) : (
                      selectedOutcome && userShares > 0 && (
                        <span className="select-none">
                          <span className="text-[#a3a3a3] text-[13px] leading-5 font-medium">
                            {Math.floor(userShares)} {selectedOutcome === 'yes' ? 'Yes' : 'No'} contracts
                          </span>
                        </span>
                      )
                    )}
                  </div>
                  <span className="flex items-center">
                    <input
                      className="text-3xl font-semibold tracking-[-0.6px] rounded-md w-[145px] border-0 outline-0 p-0 bg-transparent placeholder:!text-[#4a4a4a] text-white text-right block"
                      id="cost-input"
                      placeholder={orderType === 'buy' ? '$0' : '0'}
                      inputMode="numeric"
                      autoComplete="off"
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </span>
                </span>
              </label>
            </div>

            {/* Quote Display */}
            {quote && !fetchingQuote && (
              <div className="space-y-2 animate-fade-in">
                {orderType === 'buy' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#a3a3a3]">Contracts</span>
                      <span className="text-[15px] text-white font-medium">
                        {Math.floor(quote.contracts)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#a3a3a3]">Avg cost/contract</span>
                      <span className="text-[15px] text-white font-medium">
                        {Math.round((quote.usdcCost / quote.contracts) * 100)}¢
                      </span>
                    </div>
                    {quote.platformFee > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-[#a3a3a3]">Platform Fee</span>
                        <span className="text-[15px] text-white font-medium">
                          ${quote.platformFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#a3a3a3] font-medium">Total Cost</span>
                      <span className="text-[15px] text-white font-semibold">
                        ${quote.totalCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#22c55e]">Payout if {selectedOutcome === 'yes' ? 'Yes' : 'No'} wins</span>
                      <span className="text-[15px] text-[#22c55e] font-semibold">
                        ${quote.payout.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#a3a3a3]">USDC Received</span>
                      <span className="text-[15px] text-white font-medium">
                        ${quote.usdcCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-[#a3a3a3]">Avg price/contract</span>
                      <span className="text-[15px] text-white font-medium">
                        {Math.round((quote.usdcCost / quote.contracts) * 100)}¢
                      </span>
                    </div>
                    {quote.platformFee > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-[#a3a3a3]">Platform Fee</span>
                        <span className="text-[15px] text-white font-medium">
                          ${quote.platformFee.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className={`text-[13px] font-medium ${quote.totalCost < 0 ? 'text-[#ff4444]' : 'text-[#22c55e]'}`}>Total Received</span>
                      <span className={`text-[15px] font-semibold ${quote.totalCost < 0 ? 'text-[#ff4444]' : 'text-[#22c55e]'}`}>
                        ${quote.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {fetchingQuote && (
              <div className="animate-fade-in">
                <span className="text-[13px] text-[#a3a3a3]">Quote loading...</span>
              </div>
            )}

            {/* Trade error message */}
            {showTradeStatus && tradeStatus && !tradeStatus.success && (
              <div
                className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-md py-2 px-3 flex items-center justify-between gap-2"
                role="alert"
              >
                <span>{tradeStatus.message}</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowTradeStatus(false);
                    setTradeStatus(null);
                  }}
                  className="shrink-0 text-red-400 hover:text-red-300"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="w-full" style={{ marginTop: 'auto' }}>
              <button
                className={`inline-flex border-[0.5px] justify-center items-center rounded-md box-border cursor-pointer h-fit whitespace-nowrap flex-nowrap transition-all duration-150 hover:opacity-80 active:scale-90 outline-none w-full py-3 px-2 min-w-[72px] min-h-[56px] bg-transparent text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  showNoContractsError
                    ? 'border-red-500 border-2 animate-pulse'
                    : 'border border-white'
                }`}
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal();
                  } else if (isGeoblocked) {
                    return; // Do nothing if authenticated and geoblocked
                  } else {
                    handleTrade();
                  }
                }}
                disabled={loading || (isAuthenticated && (isGeoblocked || !selectedOutcome || !amount || (orderType === 'sell' && hasNoShares) || (orderType === 'buy' && hasInsufficientBalance)))}
              >
                <span className={`text-[15px] leading-6 font-medium ${showNoContractsError ? 'text-red-500' : ''}`}>
                  {!isAuthenticated ? 'Sign in to trade' :
                   isGeoblocked ? 'Unavailable in your region' :
                   showNoContractsError ? 'No contracts to sell' :
                   loading ? 'Processing...' :
                   !selectedOutcome ? 'Select Yes or No' :
                   (orderType === 'sell' && hasNoShares) ? 'No contracts to sell' :
                   (orderType === 'buy' && hasInsufficientBalance) ? 'Insufficient balance' :
                   !amount ? (orderType === 'buy' ? 'Enter amount' : 'Enter contracts') :
                   orderType === 'buy'
                     ? `Buy ${selectedOutcome === 'yes' ? 'Yes' : 'No'} for $${quote?.totalCost.toFixed(2) || amount}`
                     : `Sell ${amount} ${selectedOutcome === 'yes' ? 'Yes' : 'No'} contracts`}
                </span>
              </button>

              {/* Show remaining wallet balance after trade */}
              {quote && amount && orderType === 'buy' && (
                <div className="text-center mt-1.5 mb-0">
                  <span className="text-[11px] text-[#7a7a7a]">
                    ${Math.max(0, parseFloat(amount) - quote.totalCost).toFixed(2)} will stay in your wallet
                  </span>
                </div>
              )}
            </div>
          </form>}
        </div>
      </div>
    </div>
    </>
  );
}