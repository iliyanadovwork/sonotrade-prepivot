'use client';

import * as stylex from "@stylexjs/stylex";
import { apiClient } from "@/lib/api/client";
import { useEffect, useState } from "react";

const styles = stylex.create({
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#000000",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#171717",
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    borderRightColor: "rgba(255, 255, 255, 0.1)",
    padding: "2rem 0",
  },
  sidebarHeader: {
    padding: "0 1.5rem",
    marginBottom: "2rem",
  },
  sidebarTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#fafafa",
    margin: 0,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
  },
  navItem: {
    padding: "0.75rem 1.5rem",
    color: "#a3a3a3",
    cursor: "pointer",
    transitionProperty: "background-color, color",
    transitionDuration: "150ms",
    borderWidth: 0,
    backgroundColor: "transparent",
    textAlign: "left",
    fontSize: "0.875rem",
    fontWeight: 500,
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      color: "#fafafa",
    },
  },
  navItemActive: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    color: "#60a5fa",
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    borderLeftColor: "#60a5fa",
    ":hover": {
      backgroundColor: "rgba(59, 130, 246, 0.15)",
      color: "#60a5fa",
    },
  },
  mainContent: {
    flex: 1,
    padding: "2rem",
    overflowY: "auto",
  },
  contentHeader: {
    marginBottom: "2rem",
  },
  heading: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#fafafa",
    margin: 0,
    marginBottom: "0.5rem",
  },
  subheading: {
    fontSize: "1rem",
    color: "#a3a3a3",
    margin: 0,
  },
  statusSection: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  statusCard: {
    flex: 1,
    minWidth: "200px",
    padding: "1rem",
    backgroundColor: "#171717",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statusLabel: {
    fontSize: "0.75rem",
    color: "#a3a3a3",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statusValue: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#fafafa",
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "#171717",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.875rem",
  },
  tableHeader: {
    backgroundColor: "#1f1f1f",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  th: {
    padding: "1rem 0.75rem",
    textAlign: "left",
    fontWeight: 600,
    color: "#fafafa",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "1rem 0.75rem",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    color: "#d4d4d4",
  },
  tableRow: {
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.02)",
    },
  },
  nestedMarketRow: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.02)",
    },
  },
  nestedMarketCell: {
    paddingLeft: "3rem",
  },
  eventCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  eventImage: {
    width: "48px",
    height: "48px",
    borderRadius: "0.375rem",
    objectFit: "cover",
    backgroundColor: "#262626",
  },
  eventImagePlaceholder: {
    width: "48px",
    height: "48px",
    borderRadius: "0.375rem",
    backgroundColor: "#262626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#60a5fa",
  },
  eventInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  eventTitle: {
    fontWeight: 600,
    color: "#fafafa",
    fontSize: "0.875rem",
  },
  eventSubtitle: {
    fontSize: "0.75rem",
    color: "#a3a3a3",
  },
  ticker: {
    fontFamily: "monospace",
    fontSize: "0.75rem",
    color: "#60a5fa",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.25rem",
  },
  volumeText: {
    fontWeight: 500,
    color: "#fafafa",
  },
  marketCount: {
    fontSize: "0.75rem",
    color: "#a3a3a3",
    marginTop: "0.25rem",
  },
  nestedMarketTitle: {
    fontSize: "0.8125rem",
    color: "#d4d4d4",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "3rem",
  },
  loadingText: {
    color: "#a3a3a3",
    fontSize: "0.875rem",
  },
  errorBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#f87171",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  searchBar: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1.5rem",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: "0.75rem 1rem",
    backgroundColor: "#171717",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "0.375rem",
    color: "#fafafa",
    fontSize: "0.875rem",
    outline: "none",
    ":focus": {
      borderColor: "#60a5fa",
    },
  },
  searchButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderWidth: 0,
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "#1d4ed8",
    },
    ":disabled": {
      backgroundColor: "#1e293b",
      cursor: "not-allowed",
      color: "#64748b",
    },
  },
  clearButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    color: "#a3a3a3",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transitionProperty: "background-color, color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      color: "#fafafa",
    },
  },
  filterButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "transparent",
    color: "#a3a3a3",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transitionProperty: "background-color, color, border-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      color: "#fafafa",
    },
  },
  filterButtonActive: {
    backgroundColor: "#16a34a",
    color: "#ffffff",
    borderColor: "#16a34a",
    ":hover": {
      backgroundColor: "#15803d",
      borderColor: "#15803d",
    },
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.5rem",
    padding: "1rem",
    backgroundColor: "#171717",
    borderRadius: "0.375rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  paginationInfo: {
    fontSize: "0.875rem",
    color: "#a3a3a3",
  },
  paginationButtons: {
    display: "flex",
    gap: "0.5rem",
  },
  paginationButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#262626",
    color: "#fafafa",
    borderWidth: 0,
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "#2563eb",
    },
    ":disabled": {
      backgroundColor: "#1a1a1a",
      cursor: "not-allowed",
      color: "#525252",
    },
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#262626",
    color: "#fafafa",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transitionProperty: "background-color, border-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "#2563eb",
      borderColor: "#2563eb",
    },
    ":disabled": {
      backgroundColor: "#1a1a1a",
      cursor: "not-allowed",
      color: "#525252",
    },
  },
  saveButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    borderWidth: 0,
    borderRadius: "0.375rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "pointer",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    whiteSpace: "nowrap",
    ":hover": {
      backgroundColor: "#15803d",
    },
    ":disabled": {
      backgroundColor: "#1e293b",
      cursor: "not-allowed",
      color: "#64748b",
    },
  },
  savedButton: {
    display: "inline-flex",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#64748b",
    color: "#ffffff",
    borderWidth: 0,
    borderRadius: "0.375rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "default",
    whiteSpace: "nowrap",
  },
  deleteButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    borderWidth: 0,
    borderRadius: "0.375rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "pointer",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    whiteSpace: "nowrap",
    ":hover": {
      backgroundColor: "#b91c1c",
    },
    ":disabled": {
      backgroundColor: "#1e293b",
      cursor: "not-allowed",
      color: "#64748b",
    },
  },
  sponsorGrid: {
    display: "grid",
    gridTemplateColumns: {
      default: "1fr",
      "@media (min-width: 768px)": "repeat(2, 1fr)",
      "@media (min-width: 1024px)": "repeat(4, 1fr)",
    },
    gap: "1rem",
    marginBottom: "2rem",
  },
  sponsorCard: {
    backgroundColor: "#171717",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sponsorCardTitle: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#a3a3a3",
    marginBottom: "0.5rem",
  },
  sponsorCardValue: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#fafafa",
    wordBreak: "break-all",
  },
  sponsorSection: {
    backgroundColor: "#171717",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: "2rem",
  },
  sponsorSectionTitle: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#fafafa",
    marginBottom: "1rem",
  },
  sponsorSectionText: {
    fontSize: "0.875rem",
    color: "#a3a3a3",
    marginBottom: "1rem",
  },
  depositAddressBox: {
    backgroundColor: "#000000",
    padding: "1rem",
    borderRadius: "0.375rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  depositAddress: {
    fontSize: "0.875rem",
    color: "#22c55e",
    fontFamily: "monospace",
    wordBreak: "break-all",
  },
  withdrawForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  formLabel: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#a3a3a3",
  },
  formInput: {
    padding: "0.75rem",
    backgroundColor: "#000000",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "0.375rem",
    color: "#fafafa",
    fontSize: "0.875rem",
    outline: "none",
    ":focus": {
      borderColor: "#3b82f6",
    },
  },
  withdrawButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    borderWidth: 0,
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "#2563eb",
    },
    ":disabled": {
      backgroundColor: "#171717",
      cursor: "not-allowed",
      color: "#737373",
    },
  },
  txSignature: {
    fontSize: "0.75rem",
    color: "#a3a3a3",
    fontFamily: "monospace",
  },
  categoryManagement: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  categoryTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.25rem",
    marginBottom: "0.5rem",
  },
  categoryTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.25rem 0.5rem",
    backgroundColor: "rgba(96, 165, 250, 0.15)",
    color: "#60a5fa",
    fontSize: "0.75rem",
    borderRadius: "0.25rem",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(96, 165, 250, 0.3)",
  },
  categoryTagRemove: {
    cursor: "pointer",
    fontSize: "0.875rem",
    color: "#60a5fa",
    fontWeight: 600,
    ":hover": {
      color: "#f87171",
    },
  },
  categoryDropdown: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  categorySelect: {
    flex: 1,
    padding: "0.5rem",
    backgroundColor: "#000000",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "0.25rem",
    color: "#fafafa",
    fontSize: "0.75rem",
    outline: "none",
    ":focus": {
      borderColor: "#60a5fa",
    },
  },
  addButton: {
    padding: "0.5rem 0.75rem",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    borderWidth: 0,
    borderRadius: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "#15803d",
    },
    ":disabled": {
      backgroundColor: "#1e293b",
      cursor: "not-allowed",
      color: "#64748b",
    },
  },
  imageUrlContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    maxWidth: "300px",
  },
  imageUrlInput: {
    padding: "0.5rem",
    backgroundColor: "#000000",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "0.25rem",
    color: "#fafafa",
    fontSize: "0.75rem",
    fontFamily: "monospace",
    outline: "none",
    ":focus": {
      borderColor: "#60a5fa",
    },
  },
  imageUrlDisplay: {
    fontSize: "0.75rem",
    color: "#a3a3a3",
    fontFamily: "monospace",
    wordBreak: "break-all",
    maxWidth: "300px",
  },
  updateButton: {
    padding: "0.5rem 0.75rem",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    borderWidth: 0,
    borderRadius: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transitionProperty: "background-color",
    transitionDuration: "150ms",
    ":hover": {
      backgroundColor: "#2563eb",
    },
    ":disabled": {
      backgroundColor: "#1e293b",
      cursor: "not-allowed",
      color: "#64748b",
    },
  },
});

interface User {
  _id: string;
  username?: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface DflowMarket {
  ticker: string;
  title: string;
  subtitle?: string;
  volume: number;
  volume24h: number;
  liquidity: number;
  openInterest: number;
  status?: string;
  [key: string]: any;
}

interface DflowEvent {
  ticker: string;

  Ticker: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  volume: number;
  volume24h: number;
  liquidity: number;
  openInterest: number;
  competition?: string;
  competitionScope?: string;
  markets?: DflowMarket[];
  [key: string]: any;
}

type ActiveModule = 'users' | 'markets' | 'live-markets' | 'categories' | 'sponsor' | 'ticker-links' | 'trades' | 'geoblocking';

// Helper function to format large numbers
const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return '$0.00';
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
};

export default function AdminPanel() {
  // Auth state
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const data = await apiClient.getMe();
        if (data.success && data.user?.isAdmin) {
          setIsAdmin(true);
        } else {
          localStorage.removeItem('adminToken');
        }
      } catch {
        localStorage.removeItem('adminToken');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      const data = await apiClient.adminLogin(loginEmail.trim(), loginPassword);
      if (data.success && data.user?.isAdmin) {
        localStorage.setItem('adminToken', data.accessToken);
        setIsAdmin(true);
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setLoginEmail('');
    setLoginPassword('');
  };

  const [activeModule, setActiveModule] = useState<ActiveModule>('markets');
  const [users, setUsers] = useState<User[]>([]);
  const [dflowEvents, setDflowEvents] = useState<DflowEvent[]>([]);
  const [liveMarkets, setLiveMarkets] = useState<DflowEvent[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingLiveMarkets, setLoadingLiveMarkets] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [liveMarketsError, setLiveMarketsError] = useState<string | null>(null);
  const [userAccountInfo, setUserAccountInfo] = useState<Record<string, { accountCount: number; reclaimableSOL: number }>>({});
  const [closingAccounts, setClosingAccounts] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [currentCursor, setCurrentCursor] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set());
  const [savingEvent, setSavingEvent] = useState<string | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null);
  const [sponsorData, setSponsorData] = useState<any>(null);
  const [sponsorTransactions, setSponsorTransactions] = useState<any[]>([]);
  const [loadingSponsor, setLoadingSponsor] = useState(false);
  const [sponsorError, setSponsorError] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [selectedCategoryForTicker, setSelectedCategoryForTicker] = useState<Record<string, string>>({});
  const [addingTickerToCategory, setAddingTickerToCategory] = useState<string | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<Record<string, string>>({});
  const [updatingImageUrl, setUpdatingImageUrl] = useState<string | null>(null);
  const [featuredTickers, setFeaturedTickers] = useState<Set<string>>(new Set());
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const [activeTickers, setActiveTickers] = useState<Set<string>>(new Set());
  const [togglingActive, setTogglingActive] = useState<string | null>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [tradesError, setTradesError] = useState<string | null>(null);
  const [tradesTotal, setTradesTotal] = useState(0);
  const [tradesTotalVolume, setTradesTotalVolume] = useState('0.00');
  const [tradesOffset, setTradesOffset] = useState(0);
  const [tradesFilters, setTradesFilters] = useState<{
    ticker?: string;
    userId?: string;
    side?: string;
    outcome?: string;
  }>({});
  const [geoblocks, setGeoblocks] = useState<any[]>([]);
  const [loadingGeoblocks, setLoadingGeoblocks] = useState(false);
  const [geoblocksError, setGeoblocksError] = useState<string | null>(null);
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newCountryName, setNewCountryName] = useState('');
  const [addingGeoblock, setAddingGeoblock] = useState(false);
  const [removingGeoblock, setRemovingGeoblock] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 20;

  const handleImageError = (ticker: string) => {
    setImageErrors(prev => new Set(prev).add(ticker));
  };

  // Fetch saved events
  const fetchSavedEvents = async () => {
    try {
      const result = await apiClient.getSavedEvents();
      const tickers = new Set(result.events.map(e => e.ticker));
      setSavedEvents(tickers);
    } catch (err) {
      console.error("Failed to fetch saved events:", err);
    }
  };

  // Handle save event
  const handleSaveEvent = async (ticker: string, imageUrl?: string) => {
    try {
      setSavingEvent(ticker);
      await apiClient.saveEvent(ticker, imageUrl);
      setSavedEvents(prev => new Set(prev).add(ticker));
    } catch (err) {
      console.error("Failed to save event:", err);
      alert(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setSavingEvent(null);
    }
  };

  // Handle delete event from Live Markets
  const handleDeleteFromLiveMarkets = async (ticker: string) => {
    try {
      setDeletingEvent(ticker);
      await apiClient.deleteEvent(ticker);
      setSavedEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(ticker);
        return newSet;
      });
      // Refresh live markets
      fetchLiveMarkets();
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setDeletingEvent(null);
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (ticker: string) => {
    try {
      setTogglingFeatured(ticker);
      if (featuredTickers.has(ticker)) {
        await apiClient.unfeatureTicker(ticker);
        setFeaturedTickers(prev => {
          const next = new Set(prev);
          next.delete(ticker);
          return next;
        });
      } else {
        await apiClient.featureTicker(ticker);
        setFeaturedTickers(prev => new Set(prev).add(ticker));
      }
    } catch (err) {
      console.error("Failed to toggle featured:", err);
      alert(err instanceof Error ? err.message : 'Failed to toggle featured');
    } finally {
      setTogglingFeatured(null);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (ticker: string) => {
    try {
      setTogglingActive(ticker);
      await apiClient.toggleEventActive(ticker);

      // Update active tickers set
      setActiveTickers(prev => {
        const next = new Set(prev);
        if (next.has(ticker)) {
          next.delete(ticker);
        } else {
          next.add(ticker);
        }
        return next;
      });

      // Update the active field in liveMarkets without refetching
      setLiveMarkets(prev =>
        prev.map(event =>
          event.ticker === ticker
            ? { ...event, active: !event.active }
            : event
        )
      );
    } catch (err) {
      console.error("Failed to toggle active:", err);
      alert(err instanceof Error ? err.message : 'Failed to toggle active status');
    } finally {
      setTogglingActive(null);
    }
  };

  // Handle update imageURL
  const handleUpdateImageUrl = async (ticker: string) => {
    const newImageUrl = editingImageUrl[ticker];
    if (newImageUrl === undefined) return;

    try {
      setUpdatingImageUrl(ticker);
      await apiClient.updateEvent(ticker, newImageUrl);

      // Update the live markets data
      setLiveMarkets(prev =>
        prev.map(event =>
          event.ticker === ticker
            ? { ...event, imageUrl: newImageUrl }
            : event
        )
      );

      // Clear the editing state
      setEditingImageUrl(prev => {
        const newState = { ...prev };
        delete newState[ticker];
        return newState;
      });

      alert('Image URL updated successfully');
    } catch (err) {
      console.error("Failed to update image URL:", err);
      alert(err instanceof Error ? err.message : 'Failed to update image URL');
    } finally {
      setUpdatingImageUrl(null);
    }
  };

  // Handle withdraw from sponsor wallet
  const handleWithdraw = async () => {
    if (!withdrawAddress || !withdrawAmount) {
      alert('Please enter both address and amount');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!confirm(`Withdraw ${amount} SOL to ${withdrawAddress}?`)) {
      return;
    }

    try {
      setIsWithdrawing(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('https://sonotrade-v2-production.up.railway.app/api/admin/sponsor-withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          toAddress: withdrawAddress,
          amount
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to withdraw' }));
        throw new Error(error.error || 'Failed to withdraw');
      }

      const result = await response.json();
      alert(`Withdrawal successful! Transaction: ${result.signature}`);
      
      // Refresh sponsor data
      setWithdrawAmount('');
      setWithdrawAddress('');
      setActiveModule('markets'); // Trigger refresh
      setTimeout(() => setActiveModule('sponsor'), 0);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to withdraw');
      console.error("Withdrawal error:", err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Fetch live markets based on saved tickers
  const fetchLiveMarkets = async () => {
    try {
      setLoadingLiveMarkets(true);
      setLiveMarketsError(null);

      // First, get all saved tickers from our database (including inactive ones for admin panel)
      const savedResult = await apiClient.getSavedEvents({ includeInactive: true });

      if (savedResult.events.length === 0) {
        setLiveMarkets([]);
        setLiveMarketsError('No saved events. Please save some events in the Markets module first.');
        return;
      }

      // Extract series tickers from full tickers (e.g., "TOPALBUMROCKY-25" -> "TOPALBUMROCKY")
      const seriesTickersSet = new Set<string>();
      savedResult.events.forEach(e => {
        const lastHyphenIndex = e.ticker.lastIndexOf('-');
        const seriesTicker = lastHyphenIndex > 0 ? e.ticker.substring(0, lastHyphenIndex) : e.ticker;
        seriesTickersSet.add(seriesTicker);
      });

      const seriesTickers = Array.from(seriesTickersSet);

      // Try to fetch live data from Dflow (without status restrictions)
      // Split into chunks of 25 (API max)
      const chunks: string[][] = [];
      for (let i = 0; i < seriesTickers.length; i += 25) {
        chunks.push(seriesTickers.slice(i, i + 25));
      }

      // Fetch all chunks in parallel - without status filter to get all events
      const chunkPromises = chunks.map(tickerChunk =>
        apiClient.getDflowEvents({
          seriesTickers: tickerChunk.join(','),
          withNestedMarkets: false,
        }).catch(err => {
          console.warn(`Failed to fetch chunk from Dflow:`, err);
          return { events: [], cursor: null };
        })
      );

      const chunkResults = await Promise.all(chunkPromises);
      const dflowEvents = chunkResults.flatMap(result => result.events);

      // Create a map of Dflow events by ticker for easy lookup
      const dflowEventsMap = new Map(dflowEvents.map(e => [e.ticker, e]));

      // Build final events list: use Dflow data if available, otherwise use saved data
      const finalEvents = savedResult.events.map(savedEvent => {
        const dflowEvent = dflowEventsMap.get(savedEvent.ticker);
        if (dflowEvent) {
          // Merge Dflow data with saved imageUrl, gifUrl and active status
          // Normalize Status field (Dflow uses capital S)
          return {
            ...dflowEvent,
            imageUrl: savedEvent.imageUrl || dflowEvent.imageUrl,
            active: savedEvent.active,
            status: (dflowEvent as any).status || (dflowEvent as any).Status,
          };
        } else {
          // Event not found in Dflow (might be closed/determined), show saved data
          return {
            ticker: savedEvent.ticker,
            Ticker: savedEvent.ticker,
            title: savedEvent.ticker,
            subtitle: '',
            imageUrl: savedEvent.imageUrl || '',
            active: savedEvent.active,
            status: 'closed',
            volume: 0,
            volume24h: 0,
            liquidity: 0,
            openInterest: 0,
          };
        }
      });

      setLiveMarkets(finalEvents);

      // Set active tickers for toggle state
      const activeTickersSet = new Set(
        finalEvents.filter((e: any) => e.active !== false).map((e: any) => e.ticker)
      );
      setActiveTickers(activeTickersSet);
    } catch (err) {
      setLiveMarketsError(err instanceof Error ? err.message : 'Failed to fetch live markets');
      console.error("Failed to fetch live markets:", err);
    } finally {
      setLoadingLiveMarkets(false);
    }
  };

  // Handle closing user accounts
  const handleCloseUserAccounts = async (userId: string, userEmail: string) => {
    const accountInfo = userAccountInfo[userId] || { accountCount: 0, reclaimableSOL: 0 };
    if (!confirm(`Close ${accountInfo.accountCount} losing position account(s) for ${userEmail}?\n\nThis will only close non-redeemable positions in finalized markets.\nWinning/redeemable positions will be preserved.\n\nEstimated rent reclaim: ${accountInfo.reclaimableSOL.toFixed(6)} SOL (~$${(accountInfo.reclaimableSOL * 200).toFixed(2)})`)) {
      return;
    }

    setClosingAccounts(prev => ({ ...prev, [userId]: true }));

    try {
      const result = await apiClient.closeUserTokenAccounts(userId);

      if (result.success) {
        alert(`Success! Closed ${result.closedCount} accounts. Reclaimed ${result.reclaimedSOL?.toFixed(6)} SOL (~$${((result.reclaimedSOL || 0) * 200).toFixed(2)}) to sponsor wallet.\n\nSignature: ${result.signature}`);

        // Update account info for this user
        setUserAccountInfo(prev => ({
          ...prev,
          [userId]: { accountCount: 0, reclaimableSOL: 0 }
        }));
      } else {
        alert(`Failed: ${result.error || result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to close user accounts:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to close accounts'}`);
    } finally {
      setClosingAccounts(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Fetch users when Users module is active
  useEffect(() => {
    if (activeModule === 'users') {
      const fetchUsers = async () => {
        try {
          setLoadingUsers(true);
          setUsersError(null);
          const result = await apiClient.getUsers();
          setUsers(result.users);

          // Fetch positions for each user to calculate closable accounts
          const accountInfoMap: Record<string, { accountCount: number; reclaimableSOL: number }> = {};

          await Promise.all(
            result.users.map(async (user) => {
              try {
                const positionsResult = await apiClient.getUserPositions(user._id);
                if (positionsResult.success) {
                  // Only count accounts that are closable: isRedeemable = false AND status = finalized
                  const closablePositions = positionsResult.positions.filter(
                    (pos) => !pos.isRedeemable && pos.market?.status === 'finalized'
                  );
                  const accountCount = closablePositions.length;
                  const RENT_PER_ACCOUNT = 0.00203928; // SOL
                  accountInfoMap[user._id] = {
                    accountCount,
                    reclaimableSOL: accountCount * RENT_PER_ACCOUNT
                  };
                }
              } catch (err) {
                console.warn(`Failed to fetch positions for user ${user._id}:`, err);
                accountInfoMap[user._id] = { accountCount: 0, reclaimableSOL: 0 };
              }
            })
          );

          setUserAccountInfo(accountInfoMap);
        } catch (err) {
          setUsersError(err instanceof Error ? err.message : 'Failed to fetch users');
          console.error("Failed to fetch users:", err);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [activeModule]);

  // Fetch sponsor data when Sponsor module is active
  useEffect(() => {
    if (activeModule === 'sponsor') {
      const fetchSponsorData = async () => {
        try {
          setLoadingSponsor(true);
          setSponsorError(null);
          
          const token = localStorage.getItem('adminToken');
          const authHeaders: Record<string, string> = {};
          if (token) authHeaders['Authorization'] = `Bearer ${token}`;

          // Fetch wallet info
          const walletResponse = await fetch('https://sonotrade-v2-production.up.railway.app/api/admin/sponsor-wallet', { headers: authHeaders });
          if (!walletResponse.ok) {
            const errorData = await walletResponse.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch sponsor wallet');
          }
          const walletData = await walletResponse.json();
          setSponsorData(walletData);

          // Fetch transactions
          const txResponse = await fetch('https://sonotrade-v2-production.up.railway.app/api/admin/sponsor-transactions', { headers: authHeaders });
          if (!txResponse.ok) {
            const errorData = await txResponse.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch transactions');
          }
          const txData = await txResponse.json();
          setSponsorTransactions(txData.transactions || []);
        } catch (err) {
          setSponsorError(err instanceof Error ? err.message : 'Failed to fetch sponsor data');
          console.error("Failed to fetch sponsor data:", err);
        } finally {
          setLoadingSponsor(false);
        }
      };
      fetchSponsorData();
    }
  }, [activeModule]);

  // Fetch trades when Trades module is active
  useEffect(() => {
    if (activeModule === 'trades') {
      fetchTrades();
    }
  }, [activeModule, tradesOffset, tradesFilters]);

  // Fetch trades function
  const fetchTrades = async () => {
    try {
      setLoadingTrades(true);
      setTradesError(null);
      const result = await apiClient.getTrades({
        limit: ITEMS_PER_PAGE,
        offset: tradesOffset,
        ...tradesFilters,
      });
      setTrades(result.trades);
      setTradesTotal(result.total);
      setTradesTotalVolume(result.totalVolume);
    } catch (err) {
      setTradesError(err instanceof Error ? err.message : 'Failed to fetch trades');
      console.error("Failed to fetch trades:", err);
    } finally {
      setLoadingTrades(false);
    }
  };

  // Fetch geoblocks when Geoblocking module is active
  useEffect(() => {
    if (activeModule === 'geoblocking') {
      fetchGeoblocks();
    }
  }, [activeModule]);

  // Fetch geoblocks function
  const fetchGeoblocks = async () => {
    try {
      setLoadingGeoblocks(true);
      setGeoblocksError(null);
      const result = await apiClient.getGeoblocks();
      setGeoblocks(result.geoblocks);
    } catch (err) {
      setGeoblocksError(err instanceof Error ? err.message : 'Failed to fetch geoblocked countries');
      console.error("Failed to fetch geoblocks:", err);
    } finally {
      setLoadingGeoblocks(false);
    }
  };

  // Add geoblock function
  const handleAddGeoblock = async () => {
    if (!newCountryCode.trim() || !newCountryName.trim()) {
      alert('Please enter both country code and name');
      return;
    }

    try {
      setAddingGeoblock(true);
      await apiClient.addGeoblock(newCountryCode.trim().toUpperCase(), newCountryName.trim());
      setNewCountryCode('');
      setNewCountryName('');
      await fetchGeoblocks();
    } catch (err) {
      console.error("Failed to add geoblock:", err);
      alert(err instanceof Error ? err.message : 'Failed to add geoblocked country');
    } finally {
      setAddingGeoblock(false);
    }
  };

  // Remove geoblock function
  const handleRemoveGeoblock = async (countryCode: string) => {
    if (!confirm(`Are you sure you want to unblock this country?`)) {
      return;
    }

    try {
      setRemovingGeoblock(countryCode);
      await apiClient.removeGeoblock(countryCode);
      await fetchGeoblocks();
    } catch (err) {
      console.error("Failed to remove geoblock:", err);
      alert(err instanceof Error ? err.message : 'Failed to remove geoblocked country');
    } finally {
      setRemovingGeoblock(null);
    }
  };

  // Fetch events function
  const fetchEvents = async (cursor: number = 0) => {
    try {
      setLoadingEvents(true);
      setEventsError(null);

      const result = isSearchMode && searchQuery
        ? await apiClient.searchDflowEvents({
            q: searchQuery,
            sort: 'startDate',
            limit: ITEMS_PER_PAGE,
            cursor,
            withNestedMarkets: false,
            ...(showActiveOnly && { status: 'active' }),
          })
        : await apiClient.getDflowEvents({
            limit: ITEMS_PER_PAGE,
            cursor,
            withNestedMarkets: false,
            ...(showActiveOnly && { status: 'active' }),
          });

      setDflowEvents(result.events);
      setNextCursor(result.cursor);
      setCurrentCursor(cursor);
    } catch (err) {
      setEventsError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error("Failed to fetch events:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Handle search submit
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchMode(true);
      setCurrentCursor(0);
      fetchEvents(0);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    setCurrentCursor(0);
    fetchEvents(0);
  };

  // Handle next page
  const handleNextPage = () => {
    if (nextCursor !== null) {
      fetchEvents(nextCursor);
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    const prevCursor = Math.max(0, currentCursor - ITEMS_PER_PAGE);
    fetchEvents(prevCursor);
  };

  // Fetch events when Markets module is active
  useEffect(() => {
    if (activeModule === 'markets') {
      setCurrentCursor(0);
      setIsSearchMode(false);
      setSearchQuery('');
      fetchEvents(0);
      fetchSavedEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule]);

  // Refetch events when active filter changes
  useEffect(() => {
    if (activeModule === 'markets') {
      fetchEvents(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showActiveOnly]);

  // Fetch live markets when Live Markets module is active
  useEffect(() => {
    if (activeModule === 'live-markets') {
      fetchLiveMarkets();
      // Also fetch categories for the dropdown
      const fetchCategoriesForLiveMarkets = async () => {
        try {
          const result = await apiClient.getCategories();
          setCategories(result.categories);
        } catch (err) {
          console.error("Failed to fetch categories for live markets:", err);
        }
      };
      fetchCategoriesForLiveMarkets();
      // Fetch featured tickers
      const fetchFeatured = async () => {
        try {
          const result = await apiClient.getFeatured();
          setFeaturedTickers(new Set(result.tickers));
        } catch (err) {
          console.error("Failed to fetch featured tickers:", err);
        }
      };
      fetchFeatured();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule]);

  // Fetch categories when Categories module is active
  useEffect(() => {
    if (activeModule === 'categories') {
      const fetchCategories = async () => {
        try {
          setLoadingCategories(true);
          setCategoriesError(null);
          const result = await apiClient.getCategories();
          setCategories(result.categories);
        } catch (err) {
          setCategoriesError(err instanceof Error ? err.message : 'Failed to fetch categories');
          console.error("Failed to fetch categories:", err);
        } finally {
          setLoadingCategories(false);
        }
      };
      fetchCategories();
    }
  }, [activeModule]);

  // Fetch all events (including inactive) when Ticker Links module is active
  useEffect(() => {
    if (activeModule === 'ticker-links') {
      const fetchAllEvents = async () => {
        try {
          setLoadingLiveMarkets(true);
          setLiveMarketsError(null);

          // Fetch ALL events including inactive ones
          const result = await apiClient.getSavedEvents({ includeInactive: true });

          if (result.events.length === 0) {
            setLiveMarkets([]);
            setLiveMarketsError('No saved events found.');
            return;
          }

          // Convert saved events to match DflowEvent structure
          const allEvents = result.events.map(savedEvent => ({
            ticker: savedEvent.ticker,
            Ticker: savedEvent.ticker,
            title: savedEvent.title || savedEvent.ticker,
            subtitle: '',
            imageUrl: savedEvent.imageUrl || '',
            volume: 0,
            volume24h: 0,
            liquidity: 0,
            openInterest: 0,
            active: (savedEvent as any).active !== false, // Default to true if not specified
          }));

          setLiveMarkets(allEvents);
        } catch (err) {
          setLiveMarketsError(err instanceof Error ? err.message : 'Failed to fetch events');
          console.error("Failed to fetch all events:", err);
        } finally {
          setLoadingLiveMarkets(false);
        }
      };
      fetchAllEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule]);

  // Handle create category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      setIsCreatingCategory(true);
      await apiClient.createCategory(newCategoryName, newCategoryDescription);
      setNewCategoryName('');
      setNewCategoryDescription('');
      // Refresh categories
      const result = await apiClient.getCategories();
      setCategories(result.categories);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create category');
      console.error("Failed to create category:", err);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This will not delete the associated markets.`)) {
      return;
    }

    try {
      await apiClient.deleteCategory(id);
      // Refresh categories
      const result = await apiClient.getCategories();
      setCategories(result.categories);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
      console.error("Failed to delete category:", err);
    }
  };

  // Handle add ticker to category
  const handleAddTickerToCategory = async (ticker: string) => {
    const categoryId = selectedCategoryForTicker[ticker];
    if (!categoryId) {
      alert('Please select a category');
      return;
    }

    try {
      setAddingTickerToCategory(ticker);
      await apiClient.addTickerToCategory(categoryId, ticker);

      // Refresh categories to update the tickers count
      const result = await apiClient.getCategories();
      setCategories(result.categories);

      // Clear selection
      setSelectedCategoryForTicker(prev => {
        const newState = { ...prev };
        delete newState[ticker];
        return newState;
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add ticker to category');
      console.error("Failed to add ticker to category:", err);
    } finally {
      setAddingTickerToCategory(null);
    }
  };

  // Handle remove ticker from category
  const handleRemoveTickerFromCategory = async (ticker: string, categoryId: string) => {
    try {
      await apiClient.removeTickerFromCategory(categoryId, ticker);

      // Refresh categories
      const result = await apiClient.getCategories();
      setCategories(result.categories);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove ticker from category');
      console.error("Failed to remove ticker from category:", err);
    }
  };

  // Get categories that contain a specific ticker
  const getCategoriesForTicker = (ticker: string) => {
    return categories.filter(cat => cat.tickers?.includes(ticker));
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#a3a3a3', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  // Login gate
  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '380px', padding: '0 1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.25rem', textAlign: 'center' }}>Sonotrade Admin</h1>
          <p style={{ fontSize: '13px', color: '#7a7a7a', textAlign: 'center', marginBottom: '2rem' }}>Sign in with your admin account</p>

          <input
            type="email"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Email"
            style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.375rem', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem 1rem', backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.375rem', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleLogin}
            disabled={loginLoading || !loginEmail.trim() || !loginPassword}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '0.375rem', fontSize: '14px', fontWeight: 500, cursor: loginLoading || !loginEmail.trim() || !loginPassword ? 'not-allowed' : 'pointer', opacity: loginLoading || !loginEmail.trim() || !loginPassword ? 0.5 : 1 }}
          >
            {loginLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {loginError && (
            <p style={{ color: '#f87171', fontSize: '13px', marginTop: '0.75rem', textAlign: 'center' }}>{loginError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.layout)}>
      {/* Sidebar */}
      <aside {...stylex.props(styles.sidebar)}>
        <div {...stylex.props(styles.sidebarHeader)}>
          <h1 {...stylex.props(styles.sidebarTitle)}>Sonotrade</h1>
        </div>
        <nav {...stylex.props(styles.nav)}>
          <button
            {...stylex.props(
              styles.navItem,
              activeModule === 'users' && styles.navItemActive
            )}
            onClick={() => setActiveModule('users')}
          >
            Users
          </button>
          <button
            {...stylex.props(
              styles.navItem,
              activeModule === 'markets' && styles.navItemActive
            )}
            onClick={() => setActiveModule('markets')}
          >
            Markets
          </button>
          <button
            {...stylex.props(
              styles.navItem,
              activeModule === 'live-markets' && styles.navItemActive
            )}
            onClick={() => setActiveModule('live-markets')}
          >
            Live Markets
          </button>
          <button
            {...stylex.props(
              styles.navItem,
              activeModule === 'trades' && styles.navItemActive
            )}
            onClick={() => setActiveModule('trades')}
          >
            Trades
          </button>
          <button
            {...stylex.props(
              styles.navItem,
              activeModule === 'categories' && styles.navItemActive
            )}
            onClick={() => setActiveModule('categories')}
          >
            Categories
          </button>
          <button
            {...stylex.props(
              styles.navItem,
              activeModule === 'sponsor' && styles.navItemActive
            )}
            onClick={() => setActiveModule('sponsor')}
          >
            Sponsor Wallet
          </button>
          <button
            {...stylex.props(
              styles.navItem,
              activeModule === 'geoblocking' && styles.navItemActive
            )}
            onClick={() => setActiveModule('geoblocking')}
          >
            Geoblocking
          </button>
          <button
            {...stylex.props(
              styles.navItem,
              activeModule === 'ticker-links' && styles.navItemActive
            )}
            onClick={() => setActiveModule('ticker-links')}
          >
            Ticker Links
          </button>
        </nav>
        <button
          onClick={handleLogout}
          style={{ marginTop: 'auto', marginLeft: '1.5rem', marginRight: '1.5rem', marginBottom: '0', padding: '0.5rem 0', backgroundColor: 'transparent', border: 'none', color: '#525252', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, textAlign: 'left', transitionProperty: 'color', transitionDuration: '150ms' }}
          onMouseEnter={e => (e.target as HTMLElement).style.color = '#f87171'}
          onMouseLeave={e => (e.target as HTMLElement).style.color = '#525252'}
        >
          Log out
        </button>
      </aside>

      {/* Main Content */}
      <main {...stylex.props(styles.mainContent)}>
        {activeModule === 'users' && (
          <>
            <div {...stylex.props(styles.contentHeader)}>
              <h2 {...stylex.props(styles.heading)}>Users</h2>
              <p {...stylex.props(styles.subheading)}>
                Manage and view all registered users
              </p>
            </div>

            {loadingUsers && (
              <div {...stylex.props(styles.loadingContainer)}>
                <span {...stylex.props(styles.loadingText)}>Loading users...</span>
              </div>
            )}

            {usersError && (
              <div {...stylex.props(styles.errorBadge)}>
                Error: {usersError}
              </div>
            )}

            {!loadingUsers && !usersError && users.length > 0 && (
              <div {...stylex.props(styles.tableContainer)}>
                <table {...stylex.props(styles.table)}>
                  <thead {...stylex.props(styles.tableHeader)}>
                    <tr>
                      <th {...stylex.props(styles.th)}>Username</th>
                      <th {...stylex.props(styles.th)}>Email</th>
                      <th {...stylex.props(styles.th)}>Accounts</th>
                      <th {...stylex.props(styles.th)}>Reclaimable Rent</th>
                      <th {...stylex.props(styles.th)}>Created At</th>
                      <th {...stylex.props(styles.th)}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const accountInfo = userAccountInfo[user._id] || { accountCount: 0, reclaimableSOL: 0 };
                      const isClosing = closingAccounts[user._id] || false;

                      return (
                        <tr key={user._id} {...stylex.props(styles.tableRow)}>
                          <td {...stylex.props(styles.td)}>{user.username || '-'}</td>
                          <td {...stylex.props(styles.td)}>{user.email}</td>
                          <td {...stylex.props(styles.td)}>
                            {accountInfo.accountCount > 0 ? (
                              <span style={{ color: '#fbbf24' }}>{accountInfo.accountCount}</span>
                            ) : (
                              <span style={{ color: '#6b7280' }}>0</span>
                            )}
                          </td>
                          <td {...stylex.props(styles.td)}>
                            {accountInfo.reclaimableSOL > 0 ? (
                              <span style={{ color: '#22c55e' }}>
                                {accountInfo.reclaimableSOL.toFixed(6)} SOL
                                <br />
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                  (~${(accountInfo.reclaimableSOL * 200).toFixed(2)})
                                </span>
                              </span>
                            ) : (
                              <span style={{ color: '#6b7280' }}>-</span>
                            )}
                          </td>
                          <td {...stylex.props(styles.td)}>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td {...stylex.props(styles.td)}>
                            {accountInfo.accountCount > 0 ? (
                              <button
                                onClick={() => handleCloseUserAccounts(user._id, user.email)}
                                disabled={isClosing}
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  fontSize: '0.8125rem',
                                  fontWeight: 500,
                                  borderRadius: '0.375rem',
                                  border: '1px solid #dc2626',
                                  backgroundColor: isClosing ? '#dc2626' : 'transparent',
                                  color: isClosing ? '#fff' : '#dc2626',
                                  cursor: isClosing ? 'not-allowed' : 'pointer',
                                  opacity: isClosing ? 0.6 : 1,
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isClosing) {
                                    (e.target as HTMLElement).style.backgroundColor = '#dc2626';
                                    (e.target as HTMLElement).style.color = '#fff';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isClosing) {
                                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                    (e.target as HTMLElement).style.color = '#dc2626';
                                  }
                                }}
                              >
                                {isClosing ? 'Closing...' : 'Close Accounts'}
                              </button>
                            ) : (
                              <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>No accounts</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeModule === 'markets' && (
          <>
            <div {...stylex.props(styles.contentHeader)}>
              <h2 {...stylex.props(styles.heading)}>Markets</h2>
              <p {...stylex.props(styles.subheading)}>
                View and search prediction market events from Dflow
              </p>
            </div>

            {/* Search Bar */}
            <div {...stylex.props(styles.searchBar)}>
              <input
                type="text"
                placeholder="Search markets by title or ticker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                {...stylex.props(styles.searchInput)}
              />
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || loadingEvents}
                {...stylex.props(styles.searchButton)}
              >
                Search
              </button>
              {isSearchMode && (
                <button
                  onClick={handleClearSearch}
                  {...stylex.props(styles.clearButton)}
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => {
                  setShowActiveOnly(!showActiveOnly);
                  setCurrentCursor(0);
                }}
                {...stylex.props(styles.filterButton, showActiveOnly && styles.filterButtonActive)}
              >
                {showActiveOnly ? 'Active Only' : 'All Markets'}
              </button>
            </div>

            {loadingEvents && (
              <div {...stylex.props(styles.loadingContainer)}>
                <span {...stylex.props(styles.loadingText)}>Loading events...</span>
              </div>
            )}

            {eventsError && (
              <div {...stylex.props(styles.errorBadge)}>
                Error: {eventsError}
              </div>
            )}

            {!loadingEvents && !eventsError && dflowEvents.length > 0 && (
              <div {...stylex.props(styles.tableContainer)}>
                <table {...stylex.props(styles.table)}>
                  <thead {...stylex.props(styles.tableHeader)}>
                    <tr>
                      <th {...stylex.props(styles.th)}>Event</th>
                      <th {...stylex.props(styles.th)}>Ticker</th>
                      <th {...stylex.props(styles.th)}>Volume</th>
                      <th {...stylex.props(styles.th)}>24h Volume</th>
                      <th {...stylex.props(styles.th)}>Liquidity</th>
                      <th {...stylex.props(styles.th)}>Open Interest</th>
                      <th {...stylex.props(styles.th)}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dflowEvents.map((event, index) => (
                      <tr key={event.ticker || index} {...stylex.props(styles.tableRow)}>
                        <td {...stylex.props(styles.td)}>
                          <div {...stylex.props(styles.eventCell)}>
                            {event.imageUrl && !imageErrors.has(event.ticker) ? (
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                {...stylex.props(styles.eventImage)}
                                onError={() => handleImageError(event.ticker)}
                              />
                            ) : (
                              <div {...stylex.props(styles.eventImagePlaceholder)}>
                                {event.title.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div {...stylex.props(styles.eventInfo)}>
                              <div {...stylex.props(styles.eventTitle)}>
                                {event.title}
                              </div>
                              <div {...stylex.props(styles.eventSubtitle)}>
                                {event.subtitle}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <span {...stylex.props(styles.ticker)}>{event.ticker}</span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <span {...stylex.props(styles.volumeText)}>
                            {formatNumber(event.volume)}
                          </span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <span {...stylex.props(styles.volumeText)}>
                            {formatNumber(event.volume24h)}
                          </span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <span {...stylex.props(styles.volumeText)}>
                            {formatNumber(event.liquidity)}
                          </span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <span {...stylex.props(styles.volumeText)}>
                            {formatNumber(event.openInterest)}
                          </span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          {savedEvents.has(event.ticker) ? (
                            <div {...stylex.props(styles.savedButton)}>
                              Saved
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSaveEvent(event.ticker, event.imageUrl)}
                              disabled={savingEvent === event.ticker}
                              {...stylex.props(styles.saveButton)}
                            >
                              {savingEvent === event.ticker ? 'Saving...' : 'Save'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loadingEvents && !eventsError && dflowEvents.length > 0 && (
              <div {...stylex.props(styles.pagination)}>
                <div {...stylex.props(styles.paginationInfo)}>
                  Showing {currentCursor + 1} - {currentCursor + dflowEvents.length} results
                  {isSearchMode && ` for "${searchQuery}"`}
                </div>
                <div {...stylex.props(styles.paginationButtons)}>
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentCursor === 0 || loadingEvents}
                    {...stylex.props(styles.paginationButton)}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={nextCursor === null || loadingEvents}
                    {...stylex.props(styles.paginationButton)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeModule === 'live-markets' && (
          <>
            <div {...stylex.props(styles.contentHeader)}>
              <h2 {...stylex.props(styles.heading)}>Live Markets</h2>
              <p {...stylex.props(styles.subheading)}>
                Real-time data for your saved market events
              </p>
            </div>

            {loadingLiveMarkets && (
              <div {...stylex.props(styles.loadingContainer)}>
                <span {...stylex.props(styles.loadingText)}>Loading live markets...</span>
              </div>
            )}

            {liveMarketsError && (
              <div {...stylex.props(styles.errorBadge)}>
                Error: {liveMarketsError}
              </div>
            )}

            {!loadingLiveMarkets && !liveMarketsError && liveMarkets.length > 0 && (
              <div {...stylex.props(styles.tableContainer)}>
                <table {...stylex.props(styles.table)}>
                  <thead {...stylex.props(styles.tableHeader)}>
                    <tr>
                      <th {...stylex.props(styles.th)}>Event</th>
                      <th {...stylex.props(styles.th)}>Ticker</th>
                      <th {...stylex.props(styles.th)}>Status</th>
                      <th {...stylex.props(styles.th)}>Volume</th>
                      <th {...stylex.props(styles.th)}>24h Volume</th>
                      <th {...stylex.props(styles.th)}>Liquidity</th>
                      <th {...stylex.props(styles.th)}>Open Interest</th>
                      <th {...stylex.props(styles.th)}>Image URL</th>
                      <th {...stylex.props(styles.th)}>Categories</th>
                      <th {...stylex.props(styles.th)}>Active</th>
                      <th {...stylex.props(styles.th)}>Featured</th>
                      <th {...stylex.props(styles.th)}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveMarkets.map((event, index) => {
                      const tickerCategories = getCategoriesForTicker(event.ticker);
                      return (
                        <tr key={event.ticker || index} {...stylex.props(styles.tableRow)}>
                          <td {...stylex.props(styles.td)}>
                            <div {...stylex.props(styles.eventCell)}>
                              {event.imageUrl && !imageErrors.has(event.ticker) ? (
                                <img
                                  src={event.imageUrl}
                                  alt={event.title}
                                  {...stylex.props(styles.eventImage)}
                                  onError={() => handleImageError(event.ticker)}
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <div {...stylex.props(styles.eventImagePlaceholder)}>
                                  {event.title.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div {...stylex.props(styles.eventInfo)}>
                                <div {...stylex.props(styles.eventTitle)}>
                                  {event.title}
                                </div>
                                <div {...stylex.props(styles.eventSubtitle)}>
                                  {event.subtitle}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span {...stylex.props(styles.ticker)}>{event.ticker}</span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              backgroundColor: (event as any).status === 'active' ? 'rgba(34, 197, 94, 0.15)' :
                                               (event as any).status === 'settled' ? 'rgba(96, 165, 250, 0.15)' :
                                               (event as any).status === 'closed' ? 'rgba(163, 163, 163, 0.15)' :
                                               'rgba(163, 163, 163, 0.1)',
                              color: (event as any).status === 'active' ? '#22c55e' :
                                     (event as any).status === 'settled' ? '#60a5fa' :
                                     (event as any).status === 'closed' ? '#a3a3a3' :
                                     '#7a7a7a',
                              textTransform: 'capitalize',
                            }}>
                              {(event as any).status || 'unknown'}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span {...stylex.props(styles.volumeText)}>
                              {formatNumber(event.volume)}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span {...stylex.props(styles.volumeText)}>
                              {formatNumber(event.volume24h)}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span {...stylex.props(styles.volumeText)}>
                              {formatNumber(event.liquidity)}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span {...stylex.props(styles.volumeText)}>
                              {formatNumber(event.openInterest)}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <div {...stylex.props(styles.imageUrlContainer)}>
                              {editingImageUrl[event.ticker] !== undefined ? (
                                <>
                                  <input
                                    type="text"
                                    value={editingImageUrl[event.ticker]}
                                    onChange={(e) => setEditingImageUrl(prev => ({
                                      ...prev,
                                      [event.ticker]: e.target.value
                                    }))}
                                    placeholder="Enter image URL"
                                    {...stylex.props(styles.imageUrlInput)}
                                  />
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                      onClick={() => handleUpdateImageUrl(event.ticker)}
                                      disabled={updatingImageUrl === event.ticker}
                                      {...stylex.props(styles.updateButton)}
                                    >
                                      {updatingImageUrl === event.ticker ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      onClick={() => setEditingImageUrl(prev => {
                                        const newState = { ...prev };
                                        delete newState[event.ticker];
                                        return newState;
                                      })}
                                      {...stylex.props(styles.clearButton)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div {...stylex.props(styles.imageUrlDisplay)}>
                                    {event.imageUrl || 'No image URL'}
                                  </div>
                                  <button
                                    onClick={() => setEditingImageUrl(prev => ({
                                      ...prev,
                                      [event.ticker]: event.imageUrl || ''
                                    }))}
                                    {...stylex.props(styles.addButton)}
                                  >
                                    Edit
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <div {...stylex.props(styles.categoryManagement)}>
                              {/* Current Categories */}
                              {tickerCategories.length > 0 && (
                                <div {...stylex.props(styles.categoryTags)}>
                                  {tickerCategories.map((cat) => (
                                    <span key={cat._id} {...stylex.props(styles.categoryTag)}>
                                      {cat.name}
                                      <span
                                        {...stylex.props(styles.categoryTagRemove)}
                                        onClick={() => handleRemoveTickerFromCategory(event.ticker, cat._id)}
                                      >
                                        ×
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              )}
                              {/* Add to Category Dropdown */}
                              <div {...stylex.props(styles.categoryDropdown)}>
                                <select
                                  value={selectedCategoryForTicker[event.ticker] || ''}
                                  onChange={(e) => setSelectedCategoryForTicker(prev => ({
                                    ...prev,
                                    [event.ticker]: e.target.value
                                  }))}
                                  {...stylex.props(styles.categorySelect)}
                                >
                                  <option value="">Select category...</option>
                                  {categories
                                    .filter(cat => !cat.tickers?.includes(event.ticker))
                                    .map((cat) => (
                                      <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                      </option>
                                    ))}
                                </select>
                                <button
                                  onClick={() => handleAddTickerToCategory(event.ticker)}
                                  disabled={!selectedCategoryForTicker[event.ticker] || addingTickerToCategory === event.ticker}
                                  {...stylex.props(styles.addButton)}
                                >
                                  {addingTickerToCategory === event.ticker ? 'Adding...' : 'Add'}
                                </button>
                              </div>
                            </div>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <div
                              onClick={() => togglingActive !== event.ticker && handleToggleActive(event.ticker)}
                              style={{
                                width: '44px',
                                height: '24px',
                                borderRadius: '12px',
                                backgroundColor: activeTickers.has(event.ticker) ? '#22c55e' : '#333333',
                                cursor: togglingActive === event.ticker ? 'not-allowed' : 'pointer',
                                position: 'relative',
                                transition: 'background-color 200ms',
                                opacity: togglingActive === event.ticker ? 0.5 : 1,
                              }}
                            >
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: '#fff',
                                position: 'absolute',
                                top: '3px',
                                left: activeTickers.has(event.ticker) ? '23px' : '3px',
                                transition: 'left 200ms',
                              }} />
                            </div>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <div
                              onClick={() => togglingFeatured !== event.ticker && handleToggleFeatured(event.ticker)}
                              style={{
                                width: '44px',
                                height: '24px',
                                borderRadius: '12px',
                                backgroundColor: featuredTickers.has(event.ticker) ? '#60a5fa' : '#333333',
                                cursor: togglingFeatured === event.ticker ? 'not-allowed' : 'pointer',
                                position: 'relative',
                                transition: 'background-color 200ms',
                                opacity: togglingFeatured === event.ticker ? 0.5 : 1,
                              }}
                            >
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: '#fff',
                                position: 'absolute',
                                top: '3px',
                                left: featuredTickers.has(event.ticker) ? '23px' : '3px',
                                transition: 'left 200ms',
                              }} />
                            </div>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <button
                              onClick={() => handleDeleteFromLiveMarkets(event.ticker)}
                              disabled={deletingEvent === event.ticker}
                              {...stylex.props(styles.deleteButton)}
                            >
                              {deletingEvent === event.ticker ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Categories Module */}
        {activeModule === 'categories' && (
          <>
            <div {...stylex.props(styles.contentHeader)}>
              <h2 {...stylex.props(styles.heading)}>Categories</h2>
              <p {...stylex.props(styles.subheading)}>
                Create and manage market categories
              </p>
            </div>

            {/* Create Category Form */}
            <div {...stylex.props(styles.sponsorSection)}>
              <h3 {...stylex.props(styles.sponsorSectionTitle)}>Create New Category</h3>
              <div {...stylex.props(styles.withdrawForm)}>
                <div {...stylex.props(styles.formGroup)}>
                  <label {...stylex.props(styles.formLabel)}>Category Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    {...stylex.props(styles.formInput)}
                  />
                </div>
                <div {...stylex.props(styles.formGroup)}>
                  <label {...stylex.props(styles.formLabel)}>Description (Optional)</label>
                  <input
                    type="text"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Enter category description"
                    {...stylex.props(styles.formInput)}
                  />
                </div>
                <button
                  onClick={handleCreateCategory}
                  disabled={isCreatingCategory || !newCategoryName.trim()}
                  {...stylex.props(styles.withdrawButton)}
                >
                  {isCreatingCategory ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </div>

            {loadingCategories && (
              <div {...stylex.props(styles.loadingContainer)}>
                <span {...stylex.props(styles.loadingText)}>Loading categories...</span>
              </div>
            )}

            {categoriesError && (
              <div {...stylex.props(styles.errorBadge)}>
                Error: {categoriesError}
              </div>
            )}

            {/* Categories Table */}
            {!loadingCategories && !categoriesError && categories.length > 0 && (
              <div {...stylex.props(styles.tableContainer)}>
                <table {...stylex.props(styles.table)}>
                  <thead {...stylex.props(styles.tableHeader)}>
                    <tr>
                      <th {...stylex.props(styles.th)}>Name</th>
                      <th {...stylex.props(styles.th)}>Slug</th>
                      <th {...stylex.props(styles.th)}>Description</th>
                      <th {...stylex.props(styles.th)}>Markets</th>
                      <th {...stylex.props(styles.th)}>Created</th>
                      <th {...stylex.props(styles.th)}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category._id} {...stylex.props(styles.tableRow)}>
                        <td {...stylex.props(styles.td)}>
                          <span {...stylex.props(styles.eventTitle)}>{category.name}</span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <span {...stylex.props(styles.ticker)}>{category.slug}</span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          {category.description || '-'}
                        </td>
                        <td {...stylex.props(styles.td)}>
                          {category.tickers?.length || 0} markets
                        </td>
                        <td {...stylex.props(styles.td)}>
                          {new Date(category.createdAt).toLocaleDateString()}
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <button
                            onClick={() => handleDeleteCategory(category._id, category.name)}
                            {...stylex.props(styles.deleteButton)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loadingCategories && !categoriesError && categories.length === 0 && (
              <div {...stylex.props(styles.loadingContainer)}>
                <span {...stylex.props(styles.loadingText)}>No categories yet. Create one above.</span>
              </div>
            )}
          </>
        )}

        {/* Sponsor Wallet Module */}
        {activeModule === 'sponsor' && (
          <>
            <div {...stylex.props(styles.contentHeader)}>
              <h2 {...stylex.props(styles.heading)}>Sponsor Wallet</h2>
              <p {...stylex.props(styles.subheading)}>
                Manage gasless trading sponsorship
              </p>
            </div>

            {loadingSponsor && (
              <div {...stylex.props(styles.loadingContainer)}>
                <span {...stylex.props(styles.loadingText)}>Loading sponsor wallet...</span>
              </div>
            )}

            {sponsorError && (
              <div {...stylex.props(styles.errorBadge)}>
                Error: {sponsorError}
              </div>
            )}

            {!loadingSponsor && !sponsorError && sponsorData && sponsorData.wallet && (
              <div>
                {/* Wallet Overview */}
                <div {...stylex.props(styles.sponsorGrid)}>
                  <div {...stylex.props(styles.sponsorCard)}>
                    <h3 {...stylex.props(styles.sponsorCardTitle)}>Wallet Address</h3>
                    <p {...stylex.props(styles.sponsorCardValue)}>{sponsorData.wallet.publicKey}</p>
                  </div>
                  <div {...stylex.props(styles.sponsorCard)}>
                    <h3 {...stylex.props(styles.sponsorCardTitle)}>Balance</h3>
                    <p {...stylex.props(styles.sponsorCardValue)}>{sponsorData.wallet.balance.sol} SOL</p>
                  </div>
                  <div {...stylex.props(styles.sponsorCard)}>
                    <h3 {...stylex.props(styles.sponsorCardTitle)}>Status</h3>
                    <p {...stylex.props(styles.sponsorCardValue)}>
                      {sponsorData.wallet.status === 'healthy' ? '✅ Healthy' : 
                       sponsorData.wallet.status === 'low' ? '⚠️ Low Balance' : 
                       sponsorData.wallet.status === 'critical' ? '🟠 Critical' : '🔴 Empty'}
                    </p>
                  </div>
                  <div {...stylex.props(styles.sponsorCard)}>
                    <h3 {...stylex.props(styles.sponsorCardTitle)}>Est. Transactions Remaining</h3>
                    <p {...stylex.props(styles.sponsorCardValue)}>{sponsorData.wallet.estimates.tradesRemaining}</p>
                  </div>
                </div>

                {/* Health Message */}
                {sponsorData.wallet.health.needsRefill && (
                  <div {...stylex.props(styles.sponsorSection)}>
                    <p {...stylex.props(styles.sponsorCardValue)}>
                      {sponsorData.wallet.health.message}
                    </p>
                    {sponsorData.wallet.health.recommendedRefillAmount > 0 && (
                      <p {...stylex.props(styles.sponsorSectionText)}>
                        Recommended refill: {sponsorData.wallet.health.recommendedRefillAmount} SOL
                      </p>
                    )}
                  </div>
                )}

                {/* Deposit Section */}
                <div {...stylex.props(styles.sponsorSection)}>
                  <h3 {...stylex.props(styles.sponsorSectionTitle)}>Deposit SOL</h3>
                  <p {...stylex.props(styles.sponsorSectionText)}>
                    Send SOL to this address to fund the sponsor wallet:
                  </p>
                  <div {...stylex.props(styles.depositAddressBox)}>
                    <code {...stylex.props(styles.depositAddress)}>{sponsorData.wallet.publicKey}</code>
                  </div>
                </div>

                {/* Withdraw Section */}
                <div {...stylex.props(styles.sponsorSection)}>
                  <h3 {...stylex.props(styles.sponsorSectionTitle)}>Withdraw SOL</h3>
                  <div {...stylex.props(styles.withdrawForm)}>
                    <div {...stylex.props(styles.formGroup)}>
                      <label {...stylex.props(styles.formLabel)}>Recipient Address</label>
                      <input
                        type="text"
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        placeholder="Enter Solana address"
                        {...stylex.props(styles.formInput)}
                      />
                    </div>
                    <div {...stylex.props(styles.formGroup)}>
                      <label {...stylex.props(styles.formLabel)}>Amount (SOL)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        {...stylex.props(styles.formInput)}
                      />
                    </div>
                    <button
                      onClick={handleWithdraw}
                      disabled={isWithdrawing || !withdrawAddress || !withdrawAmount}
                      {...stylex.props(styles.withdrawButton)}
                    >
                      {isWithdrawing ? 'Processing...' : 'Withdraw'}
                    </button>
                  </div>
                </div>

                {/* Transaction History */}
                {sponsorTransactions.length > 0 && (
                  <div {...stylex.props(styles.sponsorSection)}>
                    <h3 {...stylex.props(styles.sponsorSectionTitle)}>Recent Transactions</h3>
                    <div {...stylex.props(styles.tableContainer)}>
                      <table {...stylex.props(styles.table)}>
                        <thead {...stylex.props(styles.tableHeader)}>
                          <tr>
                            <th {...stylex.props(styles.th)}>Signature</th>
                            <th {...stylex.props(styles.th)}>Type</th>
                            <th {...stylex.props(styles.th)}>Amount</th>
                            <th {...stylex.props(styles.th)}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sponsorTransactions.slice(0, 10).map((tx, index) => (
                            <tr key={tx.signature || index} {...stylex.props(styles.tableRow)}>
                              <td {...stylex.props(styles.td)}>
                                <code {...stylex.props(styles.txSignature)}>
                                  {tx.signature?.substring(0, 20)}...
                                </code>
                              </td>
                              <td {...stylex.props(styles.td)}>{tx.type || 'Unknown'}</td>
                              <td {...stylex.props(styles.td)}>{tx.amount || 'N/A'} SOL</td>
                              <td {...stylex.props(styles.td)}>
                                {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Ticker Links Module */}
        {activeModule === 'ticker-links' && (
          <>
            <div {...stylex.props(styles.contentHeader)}>
              <h2 {...stylex.props(styles.heading)}>Ticker Links</h2>
              <p {...stylex.props(styles.subheading)}>
                View all tickers and their image URLs
              </p>
            </div>

            {loadingLiveMarkets && (
              <div {...stylex.props(styles.loadingContainer)}>
                <span {...stylex.props(styles.loadingText)}>Loading tickers...</span>
              </div>
            )}

            {liveMarketsError && (
              <div {...stylex.props(styles.errorBadge)}>
                Error: {liveMarketsError}
              </div>
            )}

            {!loadingLiveMarkets && !liveMarketsError && liveMarkets.length > 0 && (
              <div {...stylex.props(styles.tableContainer)}>
                <table {...stylex.props(styles.table)}>
                  <thead {...stylex.props(styles.tableHeader)}>
                    <tr>
                      <th {...stylex.props(styles.th)}>Preview</th>
                      <th {...stylex.props(styles.th)}>Ticker</th>
                      <th {...stylex.props(styles.th)}>Event Title</th>
                      <th {...stylex.props(styles.th)}>Active</th>
                      <th {...stylex.props(styles.th)}>Image URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveMarkets.map((event, index) => (
                      <tr key={event.ticker || index} {...stylex.props(styles.tableRow)}>
                        <td {...stylex.props(styles.td)}>
                          {event.imageUrl && !imageErrors.has(event.ticker) ? (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              {...stylex.props(styles.eventImage)}
                              onError={() => handleImageError(event.ticker)}
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div {...stylex.props(styles.eventImagePlaceholder)}>
                              {event.title.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <span {...stylex.props(styles.ticker)}>{event.ticker}</span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <span {...stylex.props(styles.eventTitle)}>{event.title}</span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            backgroundColor: (event as any).active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(163, 163, 163, 0.15)',
                            color: (event as any).active ? '#22c55e' : '#a3a3a3',
                          }}>
                            {(event as any).active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <div {...stylex.props(styles.imageUrlDisplay)}>
                            {event.imageUrl ? (
                              <a
                                href={event.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: '#60a5fa',
                                  textDecoration: 'none',
                                  wordBreak: 'break-all',
                                }}
                              >
                                {event.imageUrl}
                              </a>
                            ) : (
                              <span style={{ color: '#7a7a7a' }}>No image URL</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Trades Module */}
        {activeModule === 'trades' && (
          <>
            <div {...stylex.props(styles.contentHeader)}>
              <h2 {...stylex.props(styles.heading)}>Trades</h2>
              <p {...stylex.props(styles.subheading)}>View all executed trades</p>
            </div>

            {/* Filters */}
            <div style={{
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              padding: '1rem',
              backgroundColor: '#171717',
              borderRadius: '0.5rem',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <input
                type="text"
                placeholder="Filter by ticker..."
                value={tradesFilters.ticker || ''}
                onChange={(e) => {
                  setTradesFilters({ ...tradesFilters, ticker: e.target.value || undefined });
                  setTradesOffset(0);
                }}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#000000',
                  color: '#fafafa',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  minWidth: '200px',
                }}
              />
              <select
                value={tradesFilters.side || ''}
                onChange={(e) => {
                  setTradesFilters({ ...tradesFilters, side: e.target.value || undefined });
                  setTradesOffset(0);
                }}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#000000',
                  color: '#fafafa',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">All Sides</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
              <select
                value={tradesFilters.outcome || ''}
                onChange={(e) => {
                  setTradesFilters({ ...tradesFilters, outcome: e.target.value || undefined });
                  setTradesOffset(0);
                }}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#000000',
                  color: '#fafafa',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">All Outcomes</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <button
                onClick={() => {
                  setTradesFilters({});
                  setTradesOffset(0);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#262626',
                  color: '#fafafa',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Clear Filters
              </button>
            </div>

            {/* Stats */}
            <div {...stylex.props(styles.statusSection)}>
              <div {...stylex.props(styles.statusCard)}>
                <div {...stylex.props(styles.statusLabel)}>Total Trades</div>
                <div {...stylex.props(styles.statusValue)}>{tradesTotal.toLocaleString('en-US')}</div>
              </div>
              <div {...stylex.props(styles.statusCard)}>
                <div {...stylex.props(styles.statusLabel)}>Total Volume</div>
                <div {...stylex.props(styles.statusValue)}>
                  ${parseFloat(tradesTotalVolume).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div {...stylex.props(styles.statusCard)}>
                <div {...stylex.props(styles.statusLabel)}>Showing</div>
                <div {...stylex.props(styles.statusValue)}>
                  {tradesOffset + 1}-{Math.min(tradesOffset + ITEMS_PER_PAGE, tradesTotal)} of {tradesTotal}
                </div>
              </div>
            </div>

            {loadingTrades ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#a3a3a3' }}>
                Loading trades...
              </div>
            ) : tradesError ? (
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '0.5rem',
                color: '#ef4444',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}>
                Error: {tradesError}
              </div>
            ) : trades.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#a3a3a3' }}>
                No trades found
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table {...stylex.props(styles.table)}>
                    <thead>
                      <tr>
                        <th {...stylex.props(styles.th)}>Date/Time</th>
                        <th {...stylex.props(styles.th)}>User</th>
                        <th {...stylex.props(styles.th)}>Event</th>
                        <th {...stylex.props(styles.th)}>Market</th>
                        <th {...stylex.props(styles.th)}>Side</th>
                        <th {...stylex.props(styles.th)}>Outcome</th>
                        <th {...stylex.props(styles.th)}>Shares</th>
                        <th {...stylex.props(styles.th)}>Price</th>
                        <th {...stylex.props(styles.th)}>Amount</th>
                        <th {...stylex.props(styles.th)}>Fee</th>
                        <th {...stylex.props(styles.th)}>Total</th>
                        <th {...stylex.props(styles.th)}>Signature</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade) => (
                        <tr key={trade._id} {...stylex.props(styles.tableRow)}>
                          <td {...stylex.props(styles.td)}>
                            <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>
                              {new Date(trade.timestamp).toLocaleString()}
                            </div>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <div style={{ fontSize: '0.75rem' }}>
                              <div style={{ color: '#fafafa', marginBottom: '0.125rem' }}>
                                {trade.user?.username || 'Unknown'}
                              </div>
                              <div style={{ color: '#7a7a7a', fontSize: '0.625rem' }}>
                                {trade.user?.email}
                              </div>
                            </div>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <div style={{ fontSize: '0.75rem' }}>
                              <div style={{ color: '#fafafa', marginBottom: '0.125rem' }}>
                                {trade.eventTicker}
                              </div>
                              <div style={{ color: '#7a7a7a', fontSize: '0.625rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {trade.eventTitle}
                              </div>
                            </div>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <div style={{ fontSize: '0.75rem' }}>
                              <div style={{ color: '#fafafa', marginBottom: '0.125rem' }}>
                                {trade.ticker}
                              </div>
                              <div style={{ color: '#7a7a7a', fontSize: '0.625rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {trade.marketTitle}
                              </div>
                            </div>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              backgroundColor: trade.side === 'buy' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: trade.side === 'buy' ? '#22c55e' : '#ef4444',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                            }}>
                              {trade.side}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              backgroundColor: trade.outcome === 'yes' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(205, 7, 104, 0.15)',
                              color: trade.outcome === 'yes' ? '#22c55e' : '#CD0768',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                            }}>
                              {trade.outcome}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span style={{ fontSize: '0.875rem', color: '#fafafa' }}>
                              {trade.formattedShares}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span style={{ fontSize: '0.875rem', color: '#fafafa' }}>
                              ${trade.formattedPrice}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span style={{ fontSize: '0.875rem', color: '#fafafa' }}>
                              ${(parseFloat(trade.formattedShares) * parseFloat(trade.formattedPrice)).toFixed(2)}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>
                              ${trade.formattedFee}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            <span style={{ fontSize: '0.875rem', color: '#fafafa' }}>
                              ${trade.formattedAmount}
                            </span>
                          </td>
                          <td {...stylex.props(styles.td)}>
                            {trade.solanaSignature ? (
                              <a
                                href={`https://solscan.io/tx/${trade.solanaSignature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#60a5fa',
                                  textDecoration: 'none',
                                }}
                              >
                                {trade.solanaSignature.slice(0, 8)}...
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#7a7a7a' }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <button
                    onClick={() => setTradesOffset(Math.max(0, tradesOffset - ITEMS_PER_PAGE))}
                    disabled={tradesOffset === 0}
                    {...stylex.props(styles.button)}
                    style={{
                      opacity: tradesOffset === 0 ? 0.5 : 1,
                      cursor: tradesOffset === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>
                    Page {Math.floor(tradesOffset / ITEMS_PER_PAGE) + 1} of {Math.ceil(tradesTotal / ITEMS_PER_PAGE)}
                  </span>
                  <button
                    onClick={() => setTradesOffset(tradesOffset + ITEMS_PER_PAGE)}
                    disabled={tradesOffset + ITEMS_PER_PAGE >= tradesTotal}
                    {...stylex.props(styles.button)}
                    style={{
                      opacity: tradesOffset + ITEMS_PER_PAGE >= tradesTotal ? 0.5 : 1,
                      cursor: tradesOffset + ITEMS_PER_PAGE >= tradesTotal ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Geoblocking Module */}
        {activeModule === 'geoblocking' && (
          <>
            <div {...stylex.props(styles.contentHeader)}>
              <h2 {...stylex.props(styles.heading)}>Geoblocking</h2>
              <p {...stylex.props(styles.subheading)}>Manage countries where trading is restricted</p>
            </div>

            {/* Add Geoblock Form */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: '#171717',
              borderRadius: '0.5rem',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fafafa', marginBottom: '1rem', marginTop: 0 }}>
                Add Geoblocked Country
              </h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 150px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a3a3a3', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Country Code
                  </label>
                  <input
                    type="text"
                    placeholder="US"
                    maxLength={2}
                    value={newCountryCode}
                    onChange={(e) => setNewCountryCode(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#000000',
                      color: '#fafafa',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                    }}
                  />
                  <div style={{ fontSize: '0.625rem', color: '#7a7a7a', marginTop: '0.25rem' }}>
                    ISO 3166-1 alpha-2
                  </div>
                </div>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#a3a3a3', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Country Name
                  </label>
                  <input
                    type="text"
                    placeholder="United States"
                    value={newCountryName}
                    onChange={(e) => setNewCountryName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#000000',
                      color: '#fafafa',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <button
                  onClick={handleAddGeoblock}
                  disabled={addingGeoblock || !newCountryCode.trim() || !newCountryName.trim()}
                  {...stylex.props(styles.button)}
                  style={{
                    opacity: addingGeoblock || !newCountryCode.trim() || !newCountryName.trim() ? 0.5 : 1,
                    cursor: addingGeoblock || !newCountryCode.trim() || !newCountryName.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {addingGeoblock ? 'Adding...' : 'Add Country'}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div {...stylex.props(styles.statusSection)}>
              <div {...stylex.props(styles.statusCard)}>
                <div {...stylex.props(styles.statusLabel)}>Blocked Countries</div>
                <div {...stylex.props(styles.statusValue)}>{geoblocks.length}</div>
              </div>
            </div>

            {loadingGeoblocks ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#a3a3a3' }}>
                Loading geoblocked countries...
              </div>
            ) : geoblocksError ? (
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '0.5rem',
                color: '#ef4444',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}>
                Error: {geoblocksError}
              </div>
            ) : geoblocks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#a3a3a3' }}>
                No countries are currently geoblocked
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table {...stylex.props(styles.table)}>
                  <thead>
                    <tr>
                      <th {...stylex.props(styles.th)}>Country Code</th>
                      <th {...stylex.props(styles.th)}>Country Name</th>
                      <th {...stylex.props(styles.th)}>Date Added</th>
                      <th {...stylex.props(styles.th)}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geoblocks.map((geoblock) => (
                      <tr key={geoblock._id} {...stylex.props(styles.tableRow)}>
                        <td {...stylex.props(styles.td)}>
                          <span style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            borderRadius: '0.25rem',
                          }}>
                            {geoblock.countryCode}
                          </span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <span style={{ fontSize: '0.875rem', color: '#fafafa' }}>
                            {geoblock.countryName}
                          </span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <span style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>
                            {new Date(geoblock.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td {...stylex.props(styles.td)}>
                          <button
                            onClick={() => handleRemoveGeoblock(geoblock.countryCode)}
                            disabled={removingGeoblock === geoblock.countryCode}
                            {...stylex.props(styles.button)}
                            style={{
                              opacity: removingGeoblock === geoblock.countryCode ? 0.5 : 1,
                              cursor: removingGeoblock === geoblock.countryCode ? 'not-allowed' : 'pointer',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              borderColor: 'rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                            }}
                          >
                            {removingGeoblock === geoblock.countryCode ? 'Removing...' : 'Unblock'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
