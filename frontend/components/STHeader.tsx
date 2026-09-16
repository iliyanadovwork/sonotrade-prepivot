'use client';

import { useState, useEffect, useRef } from "react";
import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { AuthModal } from "./auth/AuthModal";
import { STLoginButton } from "./auth/STLoginButton";
import { STSignupButton } from "./auth/STSignupButton";
import { apiClient } from "@/lib/api/client";
import STLogo from "./layout/STLogo";
import { SearchBar } from "./SearchBar";
import { STRadioChip } from "./STRadioChip";

const styles = stylex.create({
  headerWrapper: {
    width: "100%",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
    marginBottom: "0.7rem",
    position: "sticky",
    top: 0,
    backgroundColor: "#000000",
    zIndex: 50,
    "@media (max-width: 768px)": {
      marginBottom: "0.7rem",
      borderBottomWidth: "0px",
    },
  },
  contentHeader: {
    paddingBottom: "0.625rem",
    paddingTop: "0.625rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    maxWidth: "1250px",
    margin: "0 auto",
    paddingRight: "1.25rem",
    paddingLeft: "1.25rem",
    boxSizing: "border-box",
    "@media (max-width: 768px)": {
      paddingRight: "1rem",
      paddingLeft: "1rem",
      gap: "0.5rem",
      paddingBottom: "0.5rem",
      paddingTop: "0.5rem",
    },
  },
  logo: {
    height: "32px",
    width: "auto",
    display: "block",
    "@media (max-width: 768px)": {
      height: "24px",
    },
  },
  heading: {
    fontSize: "1.5rem",
    fontWeight: 400,
    color: "#fafafa",
    margin: 0,
    fontFamily: "var(--font-geist-sans)",
    "@media (max-width: 768px)": {
      fontSize: "1.25rem",
    },
  },
  middleSection: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "500px",
    margin: "0 0.5rem",
    "@media (max-width: 640px)": {
      display: "none",
    },
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    "@media (max-width: 768px)": {
      gap: "0.5rem",
    },
  },
  portfolioSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.25rem",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      opacity: 0.8,
    },
    ":active": {
      transform: "scale(0.95)",
    },
    "@media (max-width: 768px)": {
      gap: "0.125rem",
    },
  },
  portfolioBalance: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#22c55e",
    "@media (max-width: 768px)": {
      fontSize: "0.875rem",
    },
  },
  portfolioLabel: {
    fontSize: "0.625rem",
    color: "#7a7a7a",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    "@media (max-width: 768px)": {
      fontSize: "0.625rem",
    },
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    backgroundColor: "#fff", // changed from gradient to white
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#1a1a1a", // dark text for contrast
    cursor: "pointer",
    transition: "opacity 0.2s",
    overflow: "hidden",
    ":hover": {
      opacity: 0.8,
    },
    "@media (max-width: 768px)": {
      width: "36px",
      height: "36px",
      fontSize: "1rem",
    },
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  dropdownContainer: {
    position: "relative",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 0.5rem)",
    right: 0,
    backgroundColor: "#000000",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#262626",
    padding: 0,
    minWidth: "200px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
    zIndex: 100,
    overflow: "hidden",
  },
  dropdownUsername: {
    padding: "1rem 1rem",
    fontSize: "0.9375rem",
    fontWeight: 600,
    color: "#ffffff",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#262626",
  },
  dropdownButton: {
    width: "100%",
    padding: "0.625rem 1rem",
    fontSize: "0.9375rem",
    fontWeight: 400,
    color: "#a3a3a3",
    backgroundColor: "transparent",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "transparent",
    borderRadius: 0,
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "left",
    ":hover": {
      backgroundColor: "#101010",
      color: "#ffffff",
    },
  },
  // Mobile: hide login/signup and cash/portfolio; only show STRadio + profile
  authButtonsDesktop: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    "@media (max-width: 768px)": {
      display: "none",
    },
  },
  cashPortfolioDesktop: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    "@media (max-width: 768px)": {
      display: "none",
    },
  },
});

export function STHeader() {
  const { user, wallet, isAuthenticated, isLoading, logout, showAuthModal, openAuthModal: openAuthModalFromContext, closeAuthModal } = useAuth();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [totalPositionsValue, setTotalPositionsValue] = useState(0);
  const [positionsLoaded, setPositionsLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch positions and calculate total value
  useEffect(() => {
    const fetchPositions = async () => {
      // Wait for auth to finish loading
      if (isLoading) {
        return;
      }

      if (!isAuthenticated || !wallet) {
        setTotalPositionsValue(0);
        setPositionsLoaded(true);
        return;
      }

      setPositionsLoaded(false);
      try {
        const result = await apiClient.getPositions();

        if (result.success && result.positions && result.positions.length > 0) {
          // Fetch last trade price for each position
          const positionsWithPrices = await Promise.all(
            result.positions.map(async (position: any) => {
              if (!position.market?.ticker) return position;

              // Skip fetching price for finalized positions that can't be redeemed (they're worthless)
              if (!position.isRedeemable && position.market.status === 'finalized') {
                return {
                  ...position,
                  currentPrice: 0,
                };
              }

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

          // Calculate total position value
          const total = positionsWithPrices.reduce((sum, position) => {
            if (!position.market || position.currentPrice === undefined) return sum;
            return sum + (position.balance * position.currentPrice);
          }, 0);

          setTotalPositionsValue(total);
        } else {
          setTotalPositionsValue(0);
        }
        setPositionsLoaded(true);
      } catch (err) {
        console.error('Failed to fetch positions:', err);
        setTotalPositionsValue(0);
        setPositionsLoaded(true);
      }
    };

    fetchPositions();
  }, [isLoading, isAuthenticated, wallet?.publicKey, wallet]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    openAuthModalFromContext();
  };

  const cashBalance = wallet?.balance?.usdc || 0;
  const portfolioValue = cashBalance + totalPositionsValue;

  return (
    <>
      <div {...stylex.props(styles.headerWrapper)} style={{ position: 'sticky' }}>
        <div {...stylex.props(styles.contentHeader)}>
          <STLogo />
          <div {...stylex.props(styles.middleSection)}>
            <SearchBar />
          </div>
          <div {...stylex.props(styles.rightSection)}>
            {isLoading ? (
              // Render placeholder while auth is loading to prevent layout shift
              <div style={{ width: '260px', height: '44px', opacity: 0 }}></div>
            ) : isAuthenticated && user && wallet ? (
              <>
                <STRadioChip />
                <div {...stylex.props(styles.cashPortfolioDesktop)}>
                  <div {...stylex.props(styles.portfolioSection)}>
                    <div {...stylex.props(styles.portfolioBalance)}>
                      ${cashBalance.toFixed(2)}
                    </div>
                    <div {...stylex.props(styles.portfolioLabel)}>
                      Cash
                    </div>
                  </div>
                  <Link href="/portfolio" style={{ textDecoration: 'none' }}>
                    <div {...stylex.props(styles.portfolioSection)}>
                      <div {...stylex.props(styles.portfolioBalance)}>
                        {positionsLoaded ? `$${portfolioValue.toFixed(2)}` : '...'}
                      </div>
                      <div {...stylex.props(styles.portfolioLabel)}>
                        Portfolio
                      </div>
                    </div>
                  </Link>
                </div>
                <div {...stylex.props(styles.dropdownContainer)} ref={dropdownRef}>
                  <div
                    {...stylex.props(styles.avatar)}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {user.profilePicture && (user.profilePicture.startsWith('http://') || user.profilePicture.startsWith('https://')) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        {...stylex.props(styles.avatarImage)}
                        src={user.profilePicture}
                        alt="Profile"
                      />
                    ) : (
                      user.profilePicture || user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()
                    )}
                  </div>
                  {isDropdownOpen && (
                    <div {...stylex.props(styles.dropdown)}>
                      <div {...stylex.props(styles.dropdownUsername)}>
                        {user.username || user.email}
                      </div>
                      <button
                        {...stylex.props(styles.dropdownButton)}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push('/profile');
                        }}
                      >
                        Profile
                      </button>
                      <button
                        {...stylex.props(styles.dropdownButton)}
                        onClick={handleSignOut}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <STRadioChip />
                <div {...stylex.props(styles.authButtonsDesktop)}>
                  <STLoginButton onClick={() => openAuthModal('login')} />
                  <STSignupButton onClick={() => openAuthModal('signup')} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        mode={authMode}
        onSwitchMode={() => setAuthMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
      />
    </>
  );
}
