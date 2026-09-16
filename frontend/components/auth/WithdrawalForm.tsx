'use client';

import { useState, useEffect, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/context/AuthContext';

interface WithdrawalFormProps {
  onClose: () => void;
}

export function WithdrawalForm({ onClose }: WithdrawalFormProps) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isClosingSuccessModal, setIsClosingSuccessModal] = useState(false);
  const [withdrawalDetails, setWithdrawalDetails] = useState<{
    amount: number;
    signature: string;
    fee: number;
  } | null>(null);
  const { wallet, refreshBalance, invalidateCache } = useAuth();

  useEffect(() => {
    refreshBalance();
  }, []);

  const handleCloseSuccessModal = () => {
    setIsClosingSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setIsClosingSuccessModal(false);
      setWithdrawalDetails(null);
      onClose();
    }, 200);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const numAmount = parseFloat(amount);

      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!toAddress || toAddress.length < 32) {
        throw new Error('Please enter a valid Solana address');
      }

      const result = await apiClient.withdrawUSDC(toAddress, numAmount);

      setWithdrawalDetails({
        amount: numAmount,
        signature: result.signature,
        fee: result.fee,
      });
      setShowSuccessModal(true);
      setToAddress('');
      setAmount('');

      // Invalidate cache and refresh balance after withdrawal
      invalidateCache();
      await refreshBalance(true);

    } catch (err: any) {
      setError(err.message || 'Failed to process withdrawal');
    } finally {
      setIsLoading(false);
    }
  };

  const maxAmount = wallet?.balance?.usdc || 0;

  const successModal = showSuccessModal && withdrawalDetails && typeof document !== 'undefined' && createPortal(
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
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes scaleOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
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
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-[#00e676]/10 p-3">
            <CheckCircle className="w-12 h-12 text-[#00e676]" strokeWidth={2} />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-white text-center mb-2">
          Withdraw Complete
        </h2>

        <div className="flex flex-col gap-2 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-[#262626]">
            <span className="text-[13px] text-[#a3a3a3]">Amount</span>
            <span className="text-[15px] text-white font-medium">
              ${withdrawalDetails.amount.toFixed(2)} USDC
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#262626]">
            <span className="text-[13px] text-[#a3a3a3]">Transaction</span>
            <span className="text-[15px] text-white font-medium font-mono">
              {withdrawalDetails.signature.slice(0, 8)}...{withdrawalDetails.signature.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-[13px] text-[#a3a3a3]">Fee</span>
            <span className="text-[15px] text-white font-medium">
              {withdrawalDetails.fee.toFixed(6)} SOL
            </span>
          </div>
        </div>

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

  return (
    <>
      {successModal}
      <Card className="w-full max-w-md mx-auto bg-[#000000] shadow-lg rounded-lg border border-[rgba(255,255,255,0.1)]">
        <CardHeader className="space-y-1 p-12">
          <CardTitle className="text-2xl font-bold text-center text-white">Withdraw USDC</CardTitle>
          <CardDescription className="text-center text-xs md:text-sm text-gray-400">
            Send USDC from your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Destination Address */}
            <div>
              <input
                id="toAddress"
                type="text"
                placeholder="Recipient Address"
                required
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#171717] border border-[rgba(255,255,255,0.1)] rounded-md text-white placeholder-[#7a7a7a] focus:outline-none focus:ring-2 focus:ring-white focus:border-white font-mono text-sm"
              />
            </div>

            {/* Amount */}
            <div>
              <div className="relative">
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder={`Amount (Available: $${maxAmount.toFixed(2)} USDC)`}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 pr-16 bg-[#171717] border border-[rgba(255,255,255,0.1)] rounded-md text-white placeholder-[#7a7a7a] focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => setAmount(maxAmount.toString())}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-[#262626] hover:bg-[#333333] text-white rounded transition-all active:scale-95"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-md">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 bg-[#171717] hover:bg-[#262626] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2 rounded-md transition-all cursor-pointer active:scale-95"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !toAddress || !amount}
                className="flex-1 bg-white hover:bg-gray-100 text-black font-medium px-4 py-2 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                {isLoading ? 'Processing...' : 'Withdraw'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
