'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const styles = stylex.create({
  searchContainer: {
    position: 'relative',
    width: '100%',
    minWidth: 0,
    maxWidth: '500px',
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    backgroundColor: '#171717',
    color: '#fafafa',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#262626',
    borderRadius: '0.5rem',
    outline: 'none',
    transition: 'all 0.2s',
    '::placeholder': {
      color: '#7a7a7a',
    },
    ':focus': {
      borderColor: '#404040',
      backgroundColor: '#1a1a1a',
    },
  },
  resultsDropdown: {
    position: 'absolute',
    top: 'calc(100% + 0.5rem)',
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#262626',
    borderRadius: '0.5rem',
    maxHeight: '400px',
    overflowY: 'auto',
    zIndex: 50,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
  },
  resultItem: {
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: '#262626',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    ':hover': {
      backgroundColor: '#1a1a1a',
    },
    ':last-child': {
      borderBottomWidth: 0,
    },
  },
  resultItemActive: {
    backgroundColor: '#1a1a1a',
  },
  resultImage: {
    width: '48px',
    height: '48px',
    borderRadius: '0.375rem',
    objectFit: 'cover',
    flexShrink: 0,
    backgroundColor: '#262626',
  },
  resultImagePlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '0.375rem',
    backgroundColor: '#000000',
    borderWidth: '0.5px',
    borderStyle: 'solid',
    borderColor: '#fafafa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resultContent: {
    flex: 1,
    minWidth: 0,
  },
  resultTitle: {
    fontSize: '0.875rem',
    color: '#fafafa',
    fontWeight: 500,
    marginBottom: '0.25rem',
  },
  resultSubtitle: {
    fontSize: '0.75rem',
    color: '#7a7a7a',
  },
  badge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.625rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginLeft: '0.5rem',
  },
  eventBadge: {
    backgroundColor: 'rgba(34, 218, 255, 0.1)',
    color: '#22DAFF',
  },
  marketBadge: {
    backgroundColor: 'rgba(205, 7, 104, 0.1)',
    color: '#CD0768',
  },
  emptyState: {
    padding: '2rem 1rem',
    textAlign: 'center',
    color: '#7a7a7a',
    fontSize: '0.875rem',
  },
  loadingState: {
    padding: '2rem 1rem',
    textAlign: 'center',
    color: '#7a7a7a',
    fontSize: '0.875rem',
  },
});

interface SearchResult {
  ticker: string;
  title: string;
  type: 'event' | 'market';
  eventTicker?: string;
  eventTitle?: string;
  imageUrl?: string;
}

interface SearchBarProps {
  autoFocus?: boolean;
  onSelectResult?: () => void;
}

export function SearchBar({ autoFocus, onSelectResult }: SearchBarProps = {}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.searchEvents(query);
        if (response.success && response.results) {
          setResults(response.results);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (isOpen && results.length > 0) {
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen && results.length > 0) {
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            // Navigate to specific event if one is selected
            handleSelectResult(results[selectedIndex]);
          } else if (query.trim().length > 0) {
            // Show all search results in the event grid
            const searchQuery = query.trim();
            setIsOpen(false);
            setSelectedIndex(-1);
            setQuery(''); // Clear the input
            router.push(`/?search=${encodeURIComponent(searchQuery)}`);
            onSelectResult?.();
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, results, selectedIndex, query, router, onSelectResult]
  );

  const handleSelectResult = (result: SearchResult) => {
    // Navigate to the event page
    const ticker = result.type === 'event' ? result.ticker : result.eventTicker || result.ticker;
    router.push(`/events/${ticker}`);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    onSelectResult?.();
  };

  return (
    <div ref={searchRef} {...stylex.props(styles.searchContainer)}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search events and markets..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim().length > 0 && results.length > 0 && setIsOpen(true)}
        autoFocus={autoFocus}
        {...stylex.props(styles.searchInput)}
      />

      {isOpen && (
        <div {...stylex.props(styles.resultsDropdown)}>
          {isLoading ? (
            <div {...stylex.props(styles.loadingState)}>
              <div style={{ animation: 'pulsate 2s ease-in-out infinite' }}>
                <Image
                  src="/st-glyph.png"
                  alt="Loading"
                  width={32}
                  height={32}
                  priority
                />
              </div>
            </div>
          ) : results.length === 0 ? (
            <div {...stylex.props(styles.emptyState)}>No results found</div>
          ) : (
            results.map((result, index) => (
              <div
                key={`${result.type}-${result.ticker}`}
                {...stylex.props(
                  styles.resultItem,
                  selectedIndex === index && styles.resultItemActive
                )}
                onClick={() => handleSelectResult(result)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {result.imageUrl ? (
                  <img
                    src={result.imageUrl}
                    alt={result.title}
                    {...stylex.props(styles.resultImage)}
                  />
                ) : (
                  <div {...stylex.props(styles.resultImagePlaceholder)}>
                    <Image
                      src="/st-glyph.png"
                      alt="Sonotrade"
                      width={24}
                      height={24}
                    />
                  </div>
                )}
                <div {...stylex.props(styles.resultContent)}>
                  <div {...stylex.props(styles.resultTitle)}>
                    {result.title}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
  );
}
