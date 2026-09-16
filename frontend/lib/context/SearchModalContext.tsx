'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { STSearchModal } from '@/components/STSearchModal';

interface SearchModalContextValue {
  openSearchModal: () => void;
  closeSearchModal: () => void;
}

const SearchModalContext = createContext<SearchModalContextValue | null>(null);

export function SearchModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearchModal = useCallback(() => setIsOpen(true), []);
  const closeSearchModal = useCallback(() => setIsOpen(false), []);

  return (
    <SearchModalContext.Provider value={{ openSearchModal, closeSearchModal }}>
      {children}
      <STSearchModal isOpen={isOpen} onClose={closeSearchModal} />
    </SearchModalContext.Provider>
  );
}

export function useSearchModal() {
  const ctx = useContext(SearchModalContext);
  if (!ctx) throw new Error('useSearchModal must be used within SearchModalProvider');
  return ctx;
}
