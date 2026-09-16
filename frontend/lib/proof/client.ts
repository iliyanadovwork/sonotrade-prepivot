/**
 * Proof KYC Integration
 *
 * This module handles integration with Proof for KYC verification.
 * Since we use server-managed wallets, we need to:
 * 1. Get a signature from the backend (wallet is on server)
 * 2. Redirect user to Proof with the signature
 * 3. Verify KYC status when user returns
 */

const PROOF_BASE_URL = 'https://dflow.net/proof';
const PROOF_API_URL = 'https://proof.dflow.net';

export interface ProofDeepLinkParams {
  walletAddress: string;
  signature: string;
  timestamp: number;
  redirectUri: string;
  projectId?: string;
}

/**
 * Create a deep link to redirect user to Proof for KYC verification
 */
export function createProofDeepLink(params: ProofDeepLinkParams): string {
  const queryParams = new URLSearchParams({
    wallet: params.walletAddress,
    signature: params.signature,
    timestamp: params.timestamp.toString(),
    redirect_uri: params.redirectUri,
  });

  if (params.projectId) {
    queryParams.set('projectId', params.projectId);
  }

  return `${PROOF_BASE_URL}?${queryParams.toString()}`;
}

/**
 * Check if a wallet address is KYC verified via Proof API
 */
export async function checkWalletVerification(walletAddress: string): Promise<boolean> {
  try {
    const response = await fetch(`${PROOF_API_URL}/verify/${walletAddress}`);

    if (!response.ok) {
      console.error('Failed to check verification status:', response.status);
      return false;
    }

    const { verified } = await response.json();
    return verified === true;
  } catch (error) {
    console.error('Error checking wallet verification:', error);
    return false;
  }
}

/**
 * Redirect user to Proof for KYC verification
 * This will be called when user attempts a restricted action (like buying)
 */
export function redirectToProof(params: ProofDeepLinkParams): void {
  const deepLink = createProofDeepLink(params);
  console.log('[Proof] Redirecting to deep link:', deepLink);
  console.log('[Proof] Parameters:', params);

  // Use window.location.href for redirect
  window.location.href = deepLink;
}
