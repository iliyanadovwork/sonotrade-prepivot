import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getAccount,
  getAssociatedTokenAddress,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';

export interface WalletData {
  publicKey: string;
  privateKeyBytes: Uint8Array;
}

export interface WalletBalance {
  sol: number;
  usdc: number;
}

// Mainnet RPC endpoint
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
// USDC mint address on Solana mainnet
const USDC_MINT_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export class SolanaWalletService {
  private static connection = new Connection(SOLANA_RPC_URL, 'confirmed');

  /**
   * Generates a new Solana keypair
   */
  static generateWallet(): WalletData {
    const keypair = Keypair.generate();

    return {
      publicKey: keypair.publicKey.toBase58(),
      privateKeyBytes: keypair.secretKey,
    };
  }

  /**
   * Validates a Solana public key format (Base58, 32-44 characters)
   */
  static isValidPublicKey(publicKey: string): boolean {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(publicKey);
  }

  /**
   * Gets the SOL and USDC balance for a wallet
   */
  static async getWalletBalance(publicKeyString: string): Promise<WalletBalance> {
    try {
      const publicKey = new PublicKey(publicKeyString);

      // Get SOL balance
      const solBalance = await this.connection.getBalance(publicKey);
      const solAmount = solBalance / LAMPORTS_PER_SOL;

      // Get USDC balance
      let usdcAmount = 0;
      try {
        const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
        const associatedTokenAddress = await getAssociatedTokenAddress(
          usdcMint,
          publicKey
        );

        const tokenAccount = await getAccount(
          this.connection,
          associatedTokenAddress
        );

        // USDC has 6 decimals
        usdcAmount = Number(tokenAccount.amount) / 1_000_000;
      } catch (error) {
        // Token account doesn't exist yet (no USDC received)
        usdcAmount = 0;
      }

      return {
        sol: solAmount,
        usdc: usdcAmount,
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  /**
   * Get the USDC associated token account address for a wallet
   */
  static async getUSDCTokenAddress(publicKeyString: string): Promise<string> {
    try {
      const publicKey = new PublicKey(publicKeyString);
      const usdcMint = new PublicKey(USDC_MINT_ADDRESS);

      const associatedTokenAddress = await getAssociatedTokenAddress(
        usdcMint,
        publicKey
      );

      return associatedTokenAddress.toBase58();
    } catch (error) {
      console.error('Error getting USDC token address:', error);
      throw new Error('Failed to get USDC token address');
    }
  }

  /**
   * Withdraw SOL from wallet
   */
  static async withdrawSOL(
    privateKeyBytes: Uint8Array,
    toAddress: string,
    amount: number
  ): Promise<{ signature: string; fee: number }> {
    try {
      const fromKeypair = Keypair.fromSecretKey(privateKeyBytes);
      const toPublicKey = new PublicKey(toAddress);

      // Convert SOL to lamports
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports,
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromKeypair.publicKey;

      // Sign and send
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair]
      );

      // Get transaction fee
      const txInfo = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      const fee = txInfo?.meta?.fee || 0;

      return {
        signature,
        fee: fee / LAMPORTS_PER_SOL,
      };
    } catch (error) {
      console.error('Error withdrawing SOL:', error);
      throw new Error('Failed to withdraw SOL: ' + (error as Error).message);
    }
  }

  /**
   * Withdraw USDC from wallet
   */
  static async withdrawUSDC(
    privateKeyBytes: Uint8Array,
    toAddress: string,
    amount: number
  ): Promise<{ signature: string; fee: number }> {
    try {
      const fromKeypair = Keypair.fromSecretKey(privateKeyBytes);
      const toPublicKey = new PublicKey(toAddress);
      const usdcMint = new PublicKey(USDC_MINT_ADDRESS);

      // Get source token account
      const fromTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        fromKeypair.publicKey
      );

      // Get or create destination token account
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        fromKeypair,
        usdcMint,
        toPublicKey
      );

      // USDC has 6 decimals
      const usdcAmount = Math.floor(amount * 1_000_000);

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        fromTokenAccount,
        toTokenAccount.address,
        fromKeypair.publicKey,
        usdcAmount
      );

      // Create transaction
      const transaction = new Transaction().add(transferInstruction);

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromKeypair.publicKey;

      // Sign and send
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair]
      );

      // Get transaction fee
      const txInfo = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      const fee = txInfo?.meta?.fee || 0;

      return {
        signature,
        fee: fee / LAMPORTS_PER_SOL,
      };
    } catch (error) {
      console.error('Error withdrawing USDC:', error);
      throw new Error('Failed to withdraw USDC: ' + (error as Error).message);
    }
  }

  /**
   * Withdraw USDC from wallet GASLESS - sponsor pays transaction fees
   */
  static async withdrawUSDCGasless(
    userPrivateKeyBytes: Uint8Array,
    sponsorPrivateKeyBytes: Uint8Array,
    toAddress: string,
    amount: number
  ): Promise<{ signature: string; fee: number; sponsorPublicKey: string }> {
    try {
      const userKeypair = Keypair.fromSecretKey(userPrivateKeyBytes);
      const sponsorKeypair = Keypair.fromSecretKey(sponsorPrivateKeyBytes);
      const toPublicKey = new PublicKey(toAddress);
      const usdcMint = new PublicKey(USDC_MINT_ADDRESS);

      console.log('💸 Gasless USDC withdrawal:');
      console.log('  User:', userKeypair.publicKey.toString());
      console.log('  Sponsor:', sponsorKeypair.publicKey.toString());
      console.log('  To:', toAddress);
      console.log('  Amount:', amount, 'USDC');

      // Get source token account (user's wallet)
      const fromTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        userKeypair.publicKey
      );

      // Get or create destination token account (SPONSOR pays for creation if needed)
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        sponsorKeypair, // Sponsor pays for account creation
        usdcMint,
        toPublicKey
      );

      // USDC has 6 decimals
      const usdcAmount = Math.floor(amount * 1_000_000);

      // Create transfer instruction (user sends USDC)
      const transferInstruction = createTransferInstruction(
        fromTokenAccount,
        toTokenAccount.address,
        userKeypair.publicKey, // User owns the tokens
        usdcAmount
      );

      // Create transaction with SPONSOR as fee payer
      const transaction = new Transaction().add(transferInstruction);

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sponsorKeypair.publicKey; // SPONSOR PAYS GAS

      // Sign with BOTH keypairs:
      // - User signs to authorize token transfer
      // - Sponsor signs to pay transaction fee
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [userKeypair, sponsorKeypair] // Both sign
      );

      console.log('✅ Gasless withdrawal complete:', signature);

      // Get transaction fee (paid by sponsor, but user sees $0)
      const txInfo = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      const actualFee = txInfo?.meta?.fee || 0;

      console.log('  Actual fee (paid by sponsor):', actualFee / LAMPORTS_PER_SOL, 'SOL');

      return {
        signature,
        fee: 0, // User pays $0
        sponsorPublicKey: sponsorKeypair.publicKey.toString(),
      };
    } catch (error) {
      console.error('❌ Error in gasless USDC withdrawal:', error);
      throw new Error('Failed to withdraw USDC: ' + (error as Error).message);
    }
  }
}
