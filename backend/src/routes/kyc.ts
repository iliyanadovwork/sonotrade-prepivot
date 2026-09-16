import express, { Request, Response } from 'express';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import User from '../models/User';
import { auth } from '../middleware/auth';
import { decryptPrivateKey as decryptPrivateKeyService } from '../services/crypto';

const router = express.Router();

/**
 * Proof API response type
 */
interface ProofVerificationResponse {
  verified: boolean;
}

/**
 * POST /api/kyc/proof/signature
 * Generate a Proof KYC signature for the current user's wallet
 */
router.post('/proof/signature', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    console.log('[KYC] Signature request received for user:', user?.email || 'unknown');

    if (!user) {
      console.error('[KYC] No user found in request');
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    // Check if user has a wallet
    if (!user.publicKey || !user.encryptedPrivateKey || !user.iv || !user.authTag) {
      console.error('[KYC] User missing wallet data:', {
        hasPublicKey: !!user.publicKey,
        hasEncryptedPrivateKey: !!user.encryptedPrivateKey,
        hasIv: !!user.iv,
        hasAuthTag: !!user.authTag
      });
      return res.status(404).json({
        success: false,
        error: 'No wallet found for this user'
      });
    }

    // Generate timestamp (13 digits, milliseconds)
    const timestamp = Date.now();
    console.log('[KYC] Generated timestamp:', timestamp);

    // Create the message that Proof expects
    const message = `Proof KYC verification: ${timestamp}`;
    const messageBytes = new TextEncoder().encode(message);
    console.log('[KYC] Message to sign:', message);

    // Decrypt the user's private key
    console.log('[KYC] Attempting to decrypt private key...');
    const privateKeyBytes = decryptPrivateKeyService(
      user.encryptedPrivateKey,
      user.iv,
      user.authTag
    );
    console.log('[KYC] Private key decrypted successfully');

    // Create keypair from private key
    console.log('[KYC] Creating keypair from private key...');
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    console.log('[KYC] Keypair created, public key:', keypair.publicKey.toBase58());

    // Sign the message
    console.log('[KYC] Signing message...');
    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
    const signatureBase58 = bs58.encode(signature);
    console.log('[KYC] Signature generated successfully');

    res.json({
      success: true,
      walletAddress: user.publicKey,
      signature: signatureBase58,
      timestamp,
    });
  } catch (error) {
    console.error('[KYC] Error generating Proof signature:', error);
    console.error('[KYC] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: 'Failed to generate signature',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/kyc/status
 * Check the current user's KYC verification status via Proof API
 */
router.get('/status', auth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!user.publicKey) {
      return res.status(404).json({
        success: false,
        error: 'No wallet found for this user'
      });
    }

    // Check Proof API
    const proofResponse = await fetch(
      `https://proof.dflow.net/verify/${user.publicKey}`
    );

    if (!proofResponse.ok) {
      throw new Error(`Proof API error: ${proofResponse.status}`);
    }

    const { verified } = await proofResponse.json() as ProofVerificationResponse;
    const isVerified = verified === true;

    res.json({
      success: true,
      isKycVerified: isVerified,
      walletAddress: user.publicKey,
    });
  } catch (error) {
    console.error('Error checking KYC status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check KYC status'
    });
  }
});

export default router;
