# Proof KYC Integration Guide

## Overview
This guide explains how to integrate Proof KYC into SonoTrade. Since we use server-managed wallets (users don't connect Phantom/Solflare), the integration requires backend signing.

## Deadline
**February 20, 2026 17:00 UTC** - All prediction market buying requires Proof integration

## Architecture

```
User Action (Buy) → Check KYC Status → Not Verified?
                                           ↓
                              Backend: Sign Message with User's Wallet
                                           ↓
                              Frontend: Redirect to Proof with Signature
                                           ↓
                              User: Complete KYC on Proof
                                           ↓
                              Redirect Back → Backend: Verify KYC Status
                                           ↓
                              Update User Record → Allow Trading
```

## Backend Implementation

### 1. Add KYC Fields to User Model

```typescript
// In your User schema/model
{
  isKycVerified: Boolean,
  kycVerifiedAt: Date,
  kycCheckedAt: Date, // Last time we checked Proof API
}
```

### 2. Create Proof Signature Endpoint

**Endpoint:** `POST /api/kyc/proof/signature`

This endpoint signs the Proof KYC message using the user's server-managed wallet.

```typescript
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

// POST /api/kyc/proof/signature
router.post('/kyc/proof/signature', auth, async (req, res) => {
  try {
    const user = req.user; // From auth middleware
    const wallet = await getWalletForUser(user._id);

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'No wallet found'
      });
    }

    // Generate timestamp (13 digits, milliseconds)
    const timestamp = Date.now();

    // Create the message that Proof expects
    const message = `Proof KYC verification: ${timestamp}`;
    const messageBytes = new TextEncoder().encode(message);

    // Load the user's private key from secure storage
    const privateKey = await getPrivateKeyForWallet(wallet.publicKey);
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

    // Sign the message
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
    const signatureBase58 = bs58.encode(signature);

    res.json({
      success: true,
      walletAddress: wallet.publicKey,
      signature: signatureBase58,
      timestamp,
    });
  } catch (error) {
    console.error('Error generating Proof signature:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate signature'
    });
  }
});
```

### 3. Create KYC Status Check Endpoint

**Endpoint:** `GET /api/kyc/status`

This endpoint checks if the user's wallet is verified on Proof and updates the database.

```typescript
router.get('/kyc/status', auth, async (req, res) => {
  try {
    const user = req.user;
    const wallet = await getWalletForUser(user._id);

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'No wallet found'
      });
    }

    // Check Proof API
    const response = await fetch(
      `https://proof.dflow.net/verify/${wallet.publicKey}`
    );
    const { verified } = await response.json();

    // Update user record
    await User.findByIdAndUpdate(user._id, {
      isKycVerified: verified,
      kycCheckedAt: new Date(),
      ...(verified && !user.kycVerifiedAt ? { kycVerifiedAt: new Date() } : {}),
    });

    res.json({
      success: true,
      isKycVerified: verified,
      walletAddress: wallet.publicKey,
    });
  } catch (error) {
    console.error('Error checking KYC status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check KYC status'
    });
  }
});
```

### 4. Create Trade Guard Middleware

This middleware blocks non-KYC'd users from buying (selling is allowed).

```typescript
export const requireKycForBuying = async (req, res, next) => {
  const { side } = req.body; // 'buy' or 'sell'

  // Selling is always allowed
  if (side === 'sell') {
    return next();
  }

  // For buying, check KYC status
  const user = req.user;

  // Check if we have a recent KYC check (within 1 hour)
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (user.kycCheckedAt && user.kycCheckedAt > hourAgo && user.isKycVerified) {
    return next();
  }

  // Refresh KYC status from Proof API
  const wallet = await getWalletForUser(user._id);
  const response = await fetch(
    `https://proof.dflow.net/verify/${wallet.publicKey}`
  );
  const { verified } = await response.json();

  // Update user
  await User.findByIdAndUpdate(user._id, {
    isKycVerified: verified,
    kycCheckedAt: new Date(),
  });

  if (!verified) {
    return res.status(403).json({
      success: false,
      error: 'KYC verification required for buying',
      requiresKyc: true,
    });
  }

  next();
};

// Apply to trade endpoint
router.post('/trade', auth, requireKycForBuying, async (req, res) => {
  // ... existing trade logic
});
```

## Frontend Implementation

### 1. Update API Client

Add these methods to `/frontend/lib/api/client.ts`:

```typescript
// Get Proof signature for current user's wallet
async getProofSignature(): Promise<{
  success: boolean;
  walletAddress: string;
  signature: string;
  timestamp: number;
}> {
  const response = await this.fetch('/kyc/proof/signature', {
    method: 'POST',
  });
  return response.json();
}

// Check current user's KYC status
async checkKycStatus(): Promise<{
  success: boolean;
  isKycVerified: boolean;
  walletAddress: string;
}> {
  const response = await this.fetch('/kyc/status');
  return response.json();
}
```

### 2. Create KYC Hook

File: `/frontend/hooks/useProofKyc.ts`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { redirectToProof } from '@/lib/proof/client';
import { useAuth } from '@/lib/context/AuthContext';

export function useProofKyc() {
  const { user, refreshUser } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const checkKycStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await apiClient.checkKycStatus();

      // Refresh user to get updated KYC status
      if (result.success) {
        await refreshUser();
      }

      return result.isKycVerified;
    } catch (error) {
      console.error('Failed to check KYC status:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [refreshUser]);

  const initiateKyc = useCallback(async () => {
    try {
      // Get signature from backend
      const { walletAddress, signature, timestamp } =
        await apiClient.getProofSignature();

      // Build redirect URI (current page after KYC)
      const redirectUri = `${window.location.origin}/kyc/callback`;

      // Redirect to Proof
      redirectToProof({
        walletAddress,
        signature,
        timestamp,
        redirectUri,
        projectId: 'sonotrade', // Optional: your project ID
      });
    } catch (error) {
      console.error('Failed to initiate KYC:', error);
      throw error;
    }
  }, []);

  return {
    isKycVerified: user?.isKycVerified ?? false,
    isChecking,
    checkKycStatus,
    initiateKyc,
  };
}
```

### 3. Create KYC Callback Page

File: `/frontend/app/kyc/callback/page.tsx`

```typescript
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
      await new Promise(resolve => setTimeout(resolve, 2000));

      const isVerified = await checkKycStatus();

      if (isVerified) {
        setStatus('success');
        // Redirect back to home or wherever user was
        setTimeout(() => router.push('/'), 2000);
      } else {
        setStatus('failed');
      }
    }

    verify();
  }, [checkKycStatus, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === 'checking' && (
          <>
            <h1 className="text-2xl font-bold mb-4">Verifying KYC Status...</h1>
            <p className="text-gray-400">Please wait while we confirm your verification.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-green-500 mb-4">✓ Verification Complete!</h1>
            <p className="text-gray-400">Redirecting you back...</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <h1 className="text-2xl font-bold text-red-500 mb-4">Verification Pending</h1>
            <p className="text-gray-400">
              Your verification is still processing. You'll receive an email when it's complete.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-blue-500 rounded"
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

### 4. Update TradingCard to Check KYC

In your TradingCard component where users initiate trades, add KYC check:

```typescript
import { useProofKyc } from '@/hooks/useProofKyc';

function TradingCard() {
  const { isKycVerified, initiateKyc } = useProofKyc();

  const handleBuy = async () => {
    // Check KYC before allowing buy
    if (!isKycVerified) {
      // Show modal asking user to verify
      const confirmed = confirm('KYC verification required to buy. Redirect to verification?');
      if (confirmed) {
        await initiateKyc();
      }
      return;
    }

    // Proceed with buy
    // ... existing buy logic
  };

  // Selling doesn't require KYC
  const handleSell = async () => {
    // ... existing sell logic
  };
}
```

## Testing

### 1. Test in Development

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```

### 2. Test Flow

1. Log in with email
2. Attempt to buy a prediction market
3. Get prompted for KYC
4. Redirect to Proof (test with Proof's sandbox if available)
5. Complete verification
6. Redirect back to your app
7. Verify KYC status is updated
8. Try buying again - should work

### 3. Test Verification API

```bash
# Check a wallet's verification status
curl https://proof.dflow.net/verify/YOUR_WALLET_ADDRESS
```

## Security Considerations

1. **Never expose private keys** - Keep them encrypted in your database
2. **Validate signatures server-side** when receiving trade requests
3. **Cache KYC status** but refresh periodically (every hour)
4. **Use HTTPS** for all Proof redirects and API calls
5. **Log KYC attempts** for compliance auditing

## Compliance Timeline

- **February 13, 2026**: Confirm development started ✓
- **February 20, 2026 17:00 UTC**: Must be live in production

## Questions?

Check the Proof documentation:
- Partner Integration: https://docs.dflow.net/proof/partner-integration
- API Reference: https://docs.dflow.net/proof/api-reference
