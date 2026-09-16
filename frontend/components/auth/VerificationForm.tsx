'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '@/lib/context/AuthContext';

interface VerificationFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function VerificationForm({ email, onSuccess, onBack }: VerificationFormProps) {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyCode } = useAuth();

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    // Get pasted text and extract only digits
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);

    if (digits.length === 0) return;

    // Create new code array with pasted digits
    const newCode = [...code];
    for (let i = 0; i < digits.length; i++) {
      if (i < 6) {
        newCode[i] = digits[i];
      }
    }

    setCode(newCode);

    // Focus the last filled input or the next empty one
    const lastFilledIndex = Math.min(digits.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleVerify = async () => {
    const codeString = code.join('');
    if (codeString.length !== 6) return;

    setIsLoading(true);
    setError('');

    try {
      await verifyCode(email, codeString);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (code.every((digit) => digit !== '')) {
      handleVerify();
    }
  }, [code]);

  return (
    <Card className="w-full max-w-md mx-auto bg-[#000000] shadow-lg rounded-lg border border-[rgba(255,255,255,0.1)]">
      <CardHeader className="space-y-1 p-4">
        <CardTitle className="text-2xl font-bold text-center text-white">Enter Verification Code</CardTitle>
        <CardDescription className="text-center text-gray-400">
          We sent a 6-digit code to <strong className="text-white">{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-6">
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-12 h-12 text-center text-2xl font-semibold bg-[#171717] text-white border-2 border-[rgba(255,255,255,0.1)] rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs text-center text-gray-500">
              The code will expire in 10 minutes
            </p>

            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white hover:bg-white/5 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Use different email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
