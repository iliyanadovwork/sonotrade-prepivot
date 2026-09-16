'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { EmailForm } from './EmailForm';
import { VerificationForm } from './VerificationForm';
import { WalletDisplay } from './WalletDisplay';
import { useAuth } from '@/lib/context/AuthContext';

type AuthStep = 'email' | 'verification' | 'success';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'signup';
  onSwitchMode?: () => void;
}

export function AuthModal({ isOpen, onClose, mode = 'login', onSwitchMode }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const { wallet } = useAuth();

  const handleEmailSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep('verification');
  };

  const handleVerificationSuccess = () => {
    setStep('success');
    setTimeout(() => {
      onClose();
      setStep('email');
    }, 3000);
  };

  const handleBack = () => {
    setStep('email');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ zIndex: 10001 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          setStep('email');
        }
      }}
    >
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {step === 'email' && (
          <EmailForm
            onSuccess={handleEmailSuccess}
            mode={mode}
            onSwitchMode={onSwitchMode}
          />
        )}

        {step === 'verification' && (
          <VerificationForm
            email={email}
            onSuccess={handleVerificationSuccess}
            onBack={handleBack}
          />
        )}

        {step === 'success' && wallet && (
          <Card className="w-full bg-[#000000] shadow-lg rounded-lg border border-[rgba(255,255,255,0.1)]">
            <CardHeader className="space-y-1 p-4">
              <CardTitle className="text-2xl font-bold text-center text-white">Welcome! 🎉</CardTitle>
              <CardDescription className="text-center text-xs md:text-sm text-gray-400">
                Your wallet has been created
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Your Wallet Address
                </label>
                <WalletDisplay publicKey={wallet.publicKey} />
              </div>
              <p className="text-xs text-center text-gray-500">
                You can access your wallet anytime from the header
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
