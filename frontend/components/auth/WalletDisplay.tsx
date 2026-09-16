'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '@/lib/context/AuthContext';
import type { WalletBalance } from '@/lib/types/auth';
import { WithdrawalForm } from './WithdrawalForm';

interface WalletDisplayProps {
  publicKey: string;
  balance?: WalletBalance;
  showBalance?: boolean;
}

export function WalletDisplay({ publicKey, balance, showBalance = false }: WalletDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const { refreshBalance } = useAuth();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const truncateKey = (key: string) => {
    if (key.length <= 12) return key;
    return `${key.slice(0, 6)}...${key.slice(-6)}`;
  };

  if (showBalance && balance) {
    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-50">
            <span className="text-sm font-mono text-gray-700 flex-1">
              {truncateKey(publicKey)}
            </span>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="px-3 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-white">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 uppercase">SOL</div>
                <div className="text-sm font-semibold text-gray-900">
                  {balance.sol.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">USDC</div>
                <div className="text-sm font-semibold text-gray-900">
                  ${balance.usdc.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRefreshBalance}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="px-3 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded transition-colors disabled:opacity-50"
              >
                {isRefreshing ? '...' : '↻'}
              </Button>
              <Button
                onClick={() => setShowWithdraw(true)}
                variant="outline"
                size="sm"
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white border-0 rounded transition-colors"
              >
                Withdraw
              </Button>
            </div>
          </div>
        </div>

        {/* Withdrawal Modal */}
        {showWithdraw && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowWithdraw(false);
              }
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <WithdrawalForm onClose={() => setShowWithdraw(false)} />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-gray-50">
      <span className="text-sm font-mono text-gray-700 flex-1">
        {truncateKey(publicKey)}
      </span>
      <Button
        onClick={copyToClipboard}
        variant="outline"
        size="sm"
        className="px-3 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </Button>
    </div>
  );
}
