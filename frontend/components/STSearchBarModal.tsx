'use client';

import { useEffect, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import { SearchBar } from './SearchBar';

const styles = stylex.create({
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10001,
    padding: '1rem',
  },
  content: {
    width: '100%',
    maxWidth: '500px',
  },
});

interface STSearchBarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function STSearchBarModal({ isOpen, onClose }: STSearchBarModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      {...stylex.props(styles.overlay)}
      className="animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        {...stylex.props(styles.content)}
        className="animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <SearchBar autoFocus onSelectResult={onClose} />
      </div>
    </div>
  );
}
