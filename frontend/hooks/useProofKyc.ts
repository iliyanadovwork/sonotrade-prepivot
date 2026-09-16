'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { redirectToProof } from '@/lib/proof/client';
import { useAuth } from '@/lib/context/AuthContext';

export function useProofKyc() {
  const { user, refreshUser } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check the user's KYC verification status
   * This queries the backend, which checks the Proof API
   */
  const checkKycStatus = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      const result = await apiClient.checkKycStatus();

      // Refresh user to get updated KYC status in context
      if (result.success) {
        await refreshUser();
      }

      return result.isKycVerified;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check KYC status';
      setError(errorMessage);
      console.error('Failed to check KYC status:', err);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [refreshUser]);

  /**
   * Initiate the KYC verification process
   * This gets a signature from the backend and redirects to Proof
   */
  const initiateKyc = useCallback(async () => {
    setError(null);

    try {
      console.log('[KYC] Initiating KYC verification...');

      // Get signature from backend (signed with user's server-managed wallet)
      const signatureData = await apiClient.getProofSignature();
      console.log('[KYC] Received signature data:', {
        walletAddress: signatureData.walletAddress,
        timestamp: signatureData.timestamp,
        hasSignature: !!signatureData.signature
      });

      const { walletAddress, signature, timestamp } = signatureData;

      // Build redirect URI - user returns here after KYC
      const redirectUri = `${window.location.origin}/kyc/callback`;
      console.log('[KYC] Redirect URI:', redirectUri);

      // Build the deep link
      const deepLinkUrl = `https://dflow.net/proof?wallet=${encodeURIComponent(walletAddress)}&signature=${encodeURIComponent(signature)}&timestamp=${timestamp}&redirect_uri=${encodeURIComponent(redirectUri)}&projectId=sonotrade`;
      console.log('[KYC] Deep link URL:', deepLinkUrl);

      // Redirect to Proof
      console.log('[KYC] Redirecting to Proof...');
      redirectToProof({
        walletAddress,
        signature,
        timestamp,
        redirectUri,
        projectId: 'sonotrade', // Optional: your Proof project ID
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate KYC';
      setError(errorMessage);
      console.error('[KYC] Error initiating KYC:', err);
      alert(`KYC Error: ${errorMessage}`);
      throw err;
    }
  }, []);

  /**
   * Check if user needs KYC before performing an action
   * Returns true if KYC is verified, false if not
   */
  const requireKyc = useCallback(async (): Promise<boolean> => {
    // If already verified, allow action
    if (user?.isKycVerified) {
      return true;
    }

    // Check current status
    const isVerified = await checkKycStatus();

    if (!isVerified) {
      // Prompt user to verify
      return false;
    }

    return true;
  }, [user?.isKycVerified, checkKycStatus]);

  return {
    /**
     * Whether the user is KYC verified
     */
    isKycVerified: user?.isKycVerified ?? false,

    /**
     * Whether we're currently checking KYC status
     */
    isChecking,

    /**
     * Any error that occurred during KYC operations
     */
    error,

    /**
     * Check the user's current KYC status
     */
    checkKycStatus,

    /**
     * Start the KYC verification process (redirects to Proof)
     */
    initiateKyc,

    /**
     * Check if user is KYC verified before allowing an action
     */
    requireKyc,
  };
}
