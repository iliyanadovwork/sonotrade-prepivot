'use client';

import * as stylex from '@stylexjs/stylex';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useSearchModal } from '@/lib/context/SearchModalContext';
import { Home, Search, PieChart, User } from 'lucide-react';

const styles = stylex.create({
  // Outer wrapper: fixed to viewport bottom, only visible on mobile
  wrapper: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'block',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      // Safe area: bar extends into it; padding keeps content above
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
      backgroundColor: '#0a0a0a',
      borderTopWidth: '1px',
      borderTopStyle: 'solid',
      borderTopColor: '#262626',
      boxSizing: 'border-box',
    },
  },
  // Inner strip: fixed height so icons/labels never overflow
  inner: {
    '@media (max-width: 768px)': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      height: '56px',
      flexShrink: 0,
    },
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    padding: '0.5rem',
    cursor: 'pointer',
    color: '#a3a3a3',
    textDecoration: 'none',
    fontSize: '0.625rem',
    transition: 'color 0.2s',
    flexShrink: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'none',
    font: 'inherit',
    ':hover': {
      color: '#fafafa',
    },
    ':active': {
      opacity: 0.8,
    },
  },
  itemActive: {
    color: '#fafafa',
  },
  icon: {
    width: '22px',
    height: '22px',
    flexShrink: 0,
  },
});

export function STMobileNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { openSearchModal } = useSearchModal();

  return (
    <nav
      {...stylex.props(styles.wrapper)}
      aria-label="Mobile navigation"
      role="navigation"
    >
      <div {...stylex.props(styles.inner)}>
        <Link
          href="/"
          {...stylex.props(styles.item, pathname === '/' ? styles.itemActive : {})}
          aria-label="Home"
        >
          <Home {...stylex.props(styles.icon)} strokeWidth={1.5} />
          <span>Home</span>
        </Link>

        <button
          type="button"
          {...stylex.props(styles.item)}
          aria-label="Search"
          onClick={openSearchModal}
        >
          <Search {...stylex.props(styles.icon)} strokeWidth={1.5} />
          <span>Search</span>
        </button>

        {isAuthenticated ? (
          <Link
            href="/portfolio"
            {...stylex.props(
              styles.item,
              pathname === '/portfolio' ? styles.itemActive : {}
            )}
            aria-label="Portfolio"
          >
            <PieChart {...stylex.props(styles.icon)} strokeWidth={1.5} />
            <span>Portfolio</span>
          </Link>
        ) : (
          <button
            type="button"
            {...stylex.props(styles.item)}
            aria-label="Portfolio"
            onClick={() => openAuthModal()}
          >
            <PieChart {...stylex.props(styles.icon)} strokeWidth={1.5} />
            <span>Portfolio</span>
          </button>
        )}

        <button
          type="button"
          {...stylex.props(styles.item)}
          aria-label="Profile"
          onClick={() =>
            isAuthenticated ? router.push('/profile') : openAuthModal()
          }
        >
          <User {...stylex.props(styles.icon)} strokeWidth={1.5} />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
}
