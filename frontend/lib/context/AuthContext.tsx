'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api/client';
import type { User, Wallet } from '../types/auth';

interface Position {
  mint: string;
  balance: number;
  decimals: number;
  position: 'YES' | 'NO' | 'UNKNOWN';
  isRedeemable: boolean;
  market: any;
}

interface Trade {
  _id: string;
  userId: string;
  ticker: string;
  marketTitle?: string;
  eventTicker?: string;
  side: 'buy' | 'sell';
  outcome: 'yes' | 'no';
  amount: number;
  shares: number;
  price: number;
  signature: string;
  timestamp: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  positions: Position[];
  trades: Trade[];
  positionsLoading: boolean;
  tradesLoading: boolean;
  positionsCacheTime: number | null;
  balanceCacheTime: number | null;
  tradesCacheTime: number | null;
}

interface AuthContextValue extends AuthState {
  sendVerificationCode: (email: string, username?: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  refreshBalance: (force?: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshPositions: (force?: boolean) => Promise<void>;
  refreshTrades: (force?: boolean) => Promise<void>;
  invalidateCache: () => void;
  showAuthModal: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always start with loading state to avoid hydration mismatch
  const [state, setState] = useState<AuthState>({
    user: null,
    wallet: null,
    isAuthenticated: false,
    isLoading: true,
    positions: [],
    trades: [],
    positionsLoading: false,
    tradesLoading: false,
    positionsCacheTime: null,
    balanceCacheTime: null,
    tradesCacheTime: null,
  });

  const [showAuthModal, setShowAuthModal] = useState(false);

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  // Load cached positions/trades only (not user data - always fetch fresh for signed URLs)
  useEffect(() => {
    const cachedPositions = localStorage.getItem('cachedPositions');
    const cachedTrades = localStorage.getItem('cachedTrades');
    const positionsCacheTime = localStorage.getItem('positionsCacheTime');
    const balanceCacheTime = localStorage.getItem('balanceCacheTime');
    const tradesCacheTime = localStorage.getItem('tradesCacheTime');

    try {
      const positions = cachedPositions ? JSON.parse(cachedPositions) : [];
      const trades = cachedTrades ? JSON.parse(cachedTrades) : [];

      setState(prev => ({
        ...prev,
        positions,
        trades,
        positionsCacheTime: positionsCacheTime ? parseInt(positionsCacheTime) : null,
        balanceCacheTime: balanceCacheTime ? parseInt(balanceCacheTime) : null,
        tradesCacheTime: tradesCacheTime ? parseInt(tradesCacheTime) : null,
      }));
    } catch (error) {
      console.error('Failed to parse cached data:', error);
    }
  }, []);

  // Initialize auth on mount - verify cached state with API
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Try to refresh the token first
          const refreshed = await apiClient.refreshToken();
          if (refreshed) {
            // Then fetch the current user
            const { user, wallet } = await apiClient.getCurrentUser();

            // Fetch balance if wallet exists
            let walletWithBalance = wallet || null;
            if (wallet) {
              try {
                const { balance } = await apiClient.getWalletBalance();
                walletWithBalance = { ...wallet, balance };
              } catch (error) {
                console.error('Failed to fetch balance:', error);
              }
            }

            setState((prev) => ({
              ...prev,
              user,
              wallet: walletWithBalance,
              isAuthenticated: true,
              isLoading: false,
            }));

            // Don't cache user/wallet - always fetch fresh for signed URLs
          } else {
            setState((prev) => ({
              ...prev,
              user: null,
              wallet: null,
              isAuthenticated: false,
              isLoading: false,
            }));
            localStorage.removeItem('authState');
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          setState((prev) => ({
            ...prev,
            user: null,
            wallet: null,
            isAuthenticated: false,
            isLoading: false,
          }));
          localStorage.removeItem('authState');
        }
      } else {
        setState((prev) => ({
          ...prev,
          user: null,
          wallet: null,
          isAuthenticated: false,
          isLoading: false,
        }));
        localStorage.removeItem('authState');
      }
    };

    initAuth();
  }, []);

  // Auto-refresh token every 10 minutes
  useEffect(() => {
    if (state.isAuthenticated) {
      const interval = setInterval(
        () => {
          apiClient.refreshToken().catch((error) => {
            console.error('Failed to refresh token:', error);
          });
        },
        10 * 60 * 1000
      ); // 10 minutes

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated]);

  // Invalidate cache - call this after trades, deposits, redeems, etc.
  const invalidateCache = () => {
    setState((prev) => ({
      ...prev,
      positionsCacheTime: null,
      balanceCacheTime: null,
      tradesCacheTime: null,
    }));
    localStorage.removeItem('positionsCacheTime');
    localStorage.removeItem('balanceCacheTime');
    localStorage.removeItem('tradesCacheTime');
  };

  // Fetch positions and trades when authenticated (force refresh on initial load)
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      // Force refresh on initial page load
      refreshPositions(true);
      refreshTrades(true);
      refreshBalance(true);
    }
  }, [state.isAuthenticated, state.isLoading]);

  const sendVerificationCode = async (email: string, username?: string) => {
    await apiClient.sendVerificationCode(email, username);
  };

  const verifyCode = async (email: string, code: string) => {
    const { token, refreshToken, user, wallet } = await apiClient.verifyCode(email, code);
    apiClient.setAccessToken(token);
    localStorage.setItem('refreshToken', refreshToken);

    // Fetch balance if wallet exists
    let walletWithBalance = wallet || null;
    if (wallet) {
      try {
        const { balance } = await apiClient.getWalletBalance();
        walletWithBalance = { ...wallet, balance };
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    }

    setState((prev) => ({
      ...prev,
      user,
      wallet: walletWithBalance,
      isAuthenticated: true,
      isLoading: false,
    }));

    // Cache the auth state
    // Don't cache user/wallet - always fetch fresh for signed URLs
  };

  const logout = async () => {
    await apiClient.logout();
    localStorage.removeItem('authState');
    localStorage.removeItem('cachedPositions');
    localStorage.removeItem('cachedTrades');
    setState({
      user: null,
      wallet: null,
      isAuthenticated: false,
      isLoading: false,
      positions: [],
      trades: [],
      positionsLoading: false,
      tradesLoading: false,
      positionsCacheTime: null,
      balanceCacheTime: null,
      tradesCacheTime: null,
    });
  };

  const refreshAuth = async () => {
    try {
      const { user, wallet } = await apiClient.getCurrentUser();
      setState((prev) => ({
        ...prev,
        user,
        wallet: wallet || null,
        isAuthenticated: true,
        isLoading: false,
      }));

      // Cache the auth state
      // Don't cache user/wallet - always fetch fresh for signed URLs
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      localStorage.removeItem('authState');
      setState((prev) => ({
        ...prev,
        user: null,
        wallet: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  };

  const refreshBalance = async (force: boolean = false) => {
    try {
      if (!state.wallet) return;

      // Check cache validity
      const now = Date.now();
      const cacheAge = state.balanceCacheTime ? now - state.balanceCacheTime : Infinity;

      if (!force && cacheAge < CACHE_DURATION) {
        return;
      }

      const { balance } = await apiClient.getWalletBalance();
      const cacheTime = Date.now();

      setState((prevState) => {
        const newState = {
          ...prevState,
          wallet: prevState.wallet
            ? {
                ...prevState.wallet,
                balance,
              }
            : null,
          balanceCacheTime: cacheTime,
        };

        // Update cached auth state
        if (newState.user && newState.wallet) {
          // Don't cache user/wallet - always fetch fresh for signed URLs
          localStorage.setItem('balanceCacheTime', cacheTime.toString());
        }

        return newState;
      });
    } catch (error) {
      console.error('Failed to refresh balance, using cached value:', error);
      // Keep using the cached/memoized balance from state - don't update
    }
  };

  const refreshUser = async () => {
    try {
      const { user, wallet } = await apiClient.getCurrentUser();
      setState((prevState) => {
        const newState = {
          ...prevState,
          user,
        };

        // Update cached auth state
        if (newState.user && newState.wallet) {
          // Don't cache user/wallet - always fetch fresh for signed URLs
        }

        return newState;
      });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const refreshPositions = async (force: boolean = false) => {
    try {
      if (!state.isAuthenticated) return;

      // Check cache validity
      const now = Date.now();
      const cacheAge = state.positionsCacheTime ? now - state.positionsCacheTime : Infinity;

      if (!force && cacheAge < CACHE_DURATION) {
        return;
      }

      setState((prev) => ({ ...prev, positionsLoading: true }));

      const result = await apiClient.getPositions();

      if (result.success && result.positions) {
        const cacheTime = Date.now();

        setState((prevState) => {
          const newState = {
            ...prevState,
            positions: result.positions,
            positionsLoading: false,
            positionsCacheTime: cacheTime,
          };

          // Cache positions
          localStorage.setItem('cachedPositions', JSON.stringify(result.positions));
          localStorage.setItem('positionsCacheTime', cacheTime.toString());

          return newState;
        });
      }
    } catch (error) {
      console.error('Failed to refresh positions, using cached value:', error);
      // Keep using the cached/memoized positions from state
      setState((prev) => ({ ...prev, positionsLoading: false }));
    }
  };

  const refreshTrades = async (force: boolean = false) => {
    try {
      if (!state.isAuthenticated) return;

      // Check cache validity
      const now = Date.now();
      const cacheAge = state.tradesCacheTime ? now - state.tradesCacheTime : Infinity;

      if (!force && cacheAge < CACHE_DURATION) {
        return;
      }

      setState((prev) => ({ ...prev, tradesLoading: true }));

      const result = await apiClient.getUserTrades();

      if (result.success && result.trades) {
        const cacheTime = Date.now();

        setState((prevState) => {
          const newState = {
            ...prevState,
            trades: result.trades,
            tradesLoading: false,
            tradesCacheTime: cacheTime,
          };

          // Cache trades
          localStorage.setItem('cachedTrades', JSON.stringify(result.trades));
          localStorage.setItem('tradesCacheTime', cacheTime.toString());

          return newState;
        });
      }
    } catch (error) {
      console.error('Failed to refresh trades, using cached value:', error);
      // Keep using the cached/memoized trades from state
      setState((prev) => ({ ...prev, tradesLoading: false }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        sendVerificationCode,
        verifyCode,
        logout,
        refreshAuth,
        refreshBalance,
        refreshUser,
        refreshPositions,
        refreshTrades,
        invalidateCache,
        showAuthModal,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
