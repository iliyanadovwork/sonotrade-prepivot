'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProofKyc } from '@/hooks/useProofKyc';

export default function KycCallbackPage() {
  const router = useRouter();
  const { checkKycStatus } = useProofKyc();
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');

  useEffect(() => {
    async function verify() {
      // Wait a moment for Proof to update their API
      // Proof may take a few seconds to process the verification
      await new Promise(resolve => setTimeout(resolve, 2000));

      const isVerified = await checkKycStatus();

      if (isVerified) {
        setStatus('success');
        // Redirect back to home after showing success message
        setTimeout(() => router.push('/'), 2000);
      } else {
        setStatus('failed');
      }
    }

    verify();
  }, [checkKycStatus, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center max-w-md px-6">
        {status === 'checking' && (
          <>
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Verifying KYC Status...
            </h1>
            <p className="text-gray-400">
              Please wait while we confirm your verification.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="text-green-500 text-6xl">✓</div>
            </div>
            <h1 className="text-2xl font-bold text-green-500 mb-4">
              Verification Complete!
            </h1>
            <p className="text-gray-400">
              Your account has been verified. You can now buy prediction markets.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Redirecting you back...
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="mb-6">
              <div className="text-yellow-500 text-6xl">⏳</div>
            </div>
            <h1 className="text-2xl font-bold text-yellow-500 mb-4">
              Verification Pending
            </h1>
            <p className="text-gray-400 mb-6">
              Your verification is still processing. This typically takes a few minutes.
              You'll receive an email when it's complete.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
