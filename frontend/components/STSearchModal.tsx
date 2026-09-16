'use client';

import { useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { SearchBar } from './SearchBar';

interface STSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function STSearchModal({ isOpen, onClose }: STSearchModalProps) {
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
      className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 pt-12 md:items-center md:pt-4 animate-in fade-in duration-200"
      style={{ zIndex: 10001 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full bg-[#000000] shadow-lg rounded-lg border border-[rgba(255,255,255,0.1)]">
          <CardContent className="p-4">
            <SearchBar autoFocus onSelectResult={onClose} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
