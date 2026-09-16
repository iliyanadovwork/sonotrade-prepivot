import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import {
  generateVerificationCode,
  hashVerificationCode,
  compareVerificationCode,
  encryptPrivateKey,
  decryptPrivateKey,
} from '../services/crypto';
import { EmailService } from '../services/email';
import { SolanaWalletService } from '../services/solana';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const VERIFICATION_CODE_EXPIRY_MINUTES = 10;
const MAX_VERIFICATION_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_HOURS = 1;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets must be defined in environment variables');
}

/**
 * POST /api/auth/admin-login
 * Authenticates admin using credentials from env vars
 */
router.post('/admin-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return res.status(500).json({
        success: false,
        error: 'Admin credentials not configured',
      });
    }

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Find or create admin user
    let user = await User.findOne({ email: adminEmail });
    if (!user) {
      user = new User({
        email: adminEmail,
        isAdmin: true,
        isEmailVerified: true,
        refreshTokenVersion: 0,
      });
      await user.save();
    } else if (!user.isAdmin) {
      user.isAdmin = true;
      await user.save();
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      accessToken,
      user: {
        _id: user._id,
        email: user.email,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({
      success: false,
      error: 'Admin login failed',
    });
  }
});

/**
 * POST /api/auth/send-code
 * Sends a verification code to the user's email
 */
router.post('/send-code', async (req: Request, res: Response) => {
  try {
    const { email, username } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email is required',
      });
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    // Check rate limiting
    if (user) {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000);

      if (user.lastVerificationRequest && user.lastVerificationRequest > hourAgo) {
        if (user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
          const retryAfter = Math.ceil(
            (user.lastVerificationRequest.getTime() +
              RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000 -
              now.getTime()) /
              1000
          );

          return res.status(429).json({
            success: false,
            error: 'Too many verification attempts. Please try again later.',
            retryAfter,
          });
        }
      } else {
        // Reset attempts after rate limit window
        user.verificationAttempts = 0;
      }

      // Update username if provided and user exists
      if (username) {
        user.username = username;
      }
    } else {
      // Create new user
      user = new User({
        email: email.toLowerCase(),
        username: username || undefined,
        isEmailVerified: false,
        verificationAttempts: 0,
        refreshTokenVersion: 0,
      });
    }

    // Generate verification code
    const code = generateVerificationCode();
    const hashedCode = await hashVerificationCode(code);

    // Update user with verification code
    user.verificationCode = hashedCode;
    user.verificationCodeExpiry = new Date(
      Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000
    );
    user.verificationAttempts += 1;
    user.lastVerificationRequest = new Date();

    await user.save();

    // Send email
    await EmailService.sendVerificationCode(email, code);

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: VERIFICATION_CODE_EXPIRY_MINUTES * 60,
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send verification code',
    });
  }
});

/**
 * POST /api/auth/verify-code
 * Verifies the code and creates/logs in the user
 */
router.post('/verify-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email and code are required',
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: 'Code must be a 6-digit number',
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.verificationCode || !user.verificationCodeExpiry) {
      return res.status(400).json({
        success: false,
        error: 'No verification code found. Please request a new code.',
      });
    }

    // Check expiry
    if (new Date() > user.verificationCodeExpiry) {
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please request a new code.',
      });
    }

    // Verify code
    const isValidCode = await compareVerificationCode(code, user.verificationCode);

    if (!isValidCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code',
      });
    }

    // Generate Solana wallet if not exists
    let walletData = null;
    if (!user.publicKey) {
      const wallet = SolanaWalletService.generateWallet();
      const encryptedData = encryptPrivateKey(wallet.privateKeyBytes);

      user.publicKey = wallet.publicKey;
      user.encryptedPrivateKey = encryptedData.encrypted;
      user.iv = encryptedData.iv;
      user.authTag = encryptedData.authTag;
      user.walletCreatedAt = new Date();

      walletData = {
        publicKey: wallet.publicKey,
        walletCreatedAt: user.walletCreatedAt,
      };

      // Send welcome email (non-blocking)
      EmailService.sendWelcomeEmail(user.email, wallet.publicKey).catch((err) => {
        console.error('Failed to send welcome email:', err);
      });
    } else {
      walletData = {
        publicKey: user.publicKey,
        walletCreatedAt: user.walletCreatedAt,
      };
    }

    // Update user
    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    user.verificationAttempts = 0;
    user.lastLoginAt = new Date();

    await user.save();

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, version: user.refreshTokenVersion },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Generate signed URL for profile picture if exists
    let profilePictureUrl = user.profilePicture;
    if (profilePictureUrl && profilePictureUrl.startsWith('profile-pictures/')) {
      const { StorageService } = await import('../services/storage');
      profilePictureUrl = await StorageService.getSignedUrl(profilePictureUrl);
    }

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        profilePicture: profilePictureUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      wallet: walletData,
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify code',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refreshes the access token using a refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: string;
      version: number;
    };

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    // Check token version
    if (decoded.version !== user.refreshTokenVersion) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token has been invalidated',
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    res.json({
      success: true,
      token: accessToken,
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(403).json({
      success: false,
      error: 'Invalid or expired refresh token',
    });
  }
});

/**
 * POST /api/auth/logout
 * Invalidates all refresh tokens for the user
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Increment token version to invalidate all refresh tokens
    user.refreshTokenVersion += 1;
    await user.save();

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout',
    });
  }
});

/**
 * GET /api/auth/me
 * Returns the current user's information
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const walletData = user.publicKey
      ? {
          publicKey: user.publicKey,
          walletCreatedAt: user.walletCreatedAt,
        }
      : null;

    // Generate signed URL if profilePicture is a storage key
    let profilePictureUrl = user.profilePicture;
    if (profilePictureUrl && profilePictureUrl.startsWith('profile-pictures/')) {
      const { StorageService } = await import('../services/storage');
      profilePictureUrl = await StorageService.getSignedUrl(profilePictureUrl);
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: profilePictureUrl,
        isAdmin: user.isAdmin,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      wallet: walletData,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user information',
    });
  }
});

/**
 * GET /api/auth/wallet/balance
 * Returns the wallet balance (SOL and USDC)
 */
router.get('/wallet/balance', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user.publicKey) {
      return res.status(404).json({
        success: false,
        error: 'No wallet found for this user',
      });
    }

    const balance = await SolanaWalletService.getWalletBalance(user.publicKey);

    res.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet balance',
    });
  }
});

/**
 * GET /api/auth/wallet/usdc-address
 * Returns the USDC associated token account address
 */
router.get('/wallet/usdc-address', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user.publicKey) {
      return res.status(404).json({
        success: false,
        error: 'No wallet found for this user',
      });
    }

    const usdcAddress = await SolanaWalletService.getUSDCTokenAddress(user.publicKey);

    res.json({
      success: true,
      usdcAddress,
      publicKey: user.publicKey,
    });
  } catch (error) {
    console.error('Error fetching USDC address:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch USDC address',
    });
  }
});

/**
 * POST /api/auth/wallet/withdraw-sol
 * Withdraw SOL from the user's wallet
 */
router.post('/wallet/withdraw-sol', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { toAddress, amount } = req.body;

    // Validate inputs
    if (!toAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Destination address and amount are required',
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number',
      });
    }

    if (!user.encryptedPrivateKey || !user.iv || !user.authTag) {
      return res.status(404).json({
        success: false,
        error: 'No wallet found for this user',
      });
    }

    // Check balance before withdrawal
    const balance = await SolanaWalletService.getWalletBalance(user.publicKey);
    const MIN_SOL_FOR_TX = 0.00002; // Minimum SOL required for transaction fee

    // Ensure user has enough SOL including the transaction fee
    if (balance.sol < amount + MIN_SOL_FOR_TX) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. You have ${balance.sol} SOL but need ${amount + MIN_SOL_FOR_TX} SOL (including ${MIN_SOL_FOR_TX} SOL for transaction fee). Maximum you can withdraw: ${(balance.sol - MIN_SOL_FOR_TX).toFixed(6)} SOL`,
      });
    }

    // Decrypt private key
    const privateKeyBytes = decryptPrivateKey(
      user.encryptedPrivateKey,
      user.iv,
      user.authTag
    );

    // Execute withdrawal
    const result = await SolanaWalletService.withdrawSOL(
      privateKeyBytes,
      toAddress,
      amount
    );

    res.json({
      success: true,
      signature: result.signature,
      fee: result.fee,
      message: `Successfully sent ${amount} SOL to ${toAddress}`,
    });
  } catch (error) {
    console.error('Error withdrawing SOL:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to withdraw SOL',
    });
  }
});

/**
 * POST /api/auth/wallet/withdraw-usdc
 * Withdraw USDC from the user's wallet (FREE - platform pays gas fees)
 */
router.post('/wallet/withdraw-usdc', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { toAddress, amount } = req.body;

    // Validate inputs
    if (!toAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Destination address and amount are required',
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number',
      });
    }

    if (!user.encryptedPrivateKey || !user.iv || !user.authTag) {
      return res.status(404).json({
        success: false,
        error: 'No wallet found for this user',
      });
    }

    // Check USDC balance before withdrawal
    const balance = await SolanaWalletService.getWalletBalance(user.publicKey);
    if (balance.usdc < amount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. You have $${balance.usdc} USDC but tried to withdraw $${amount} USDC`,
      });
    }

    // NO SOL CHECK - Platform sponsors the transaction fee!
    console.log('💸 Gasless withdrawal: Platform will sponsor transaction fees');

    // Load sponsor wallet
    const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PRIVATE_KEY;
    if (!SPONSOR_PRIVATE_KEY) {
      console.error('❌ SPONSOR_PRIVATE_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Gasless withdrawals unavailable - platform sponsor not configured',
      });
    }

    // Decrypt user private key
    const privateKeyBytes = decryptPrivateKey(
      user.encryptedPrivateKey,
      user.iv,
      user.authTag
    );

    // Execute GASLESS withdrawal (sponsor pays fees)
    const sponsorBytes = Buffer.from(SPONSOR_PRIVATE_KEY, 'base64');
    const result = await SolanaWalletService.withdrawUSDCGasless(
      privateKeyBytes,
      sponsorBytes,
      toAddress,
      amount
    );

    res.json({
      success: true,
      signature: result.signature,
      fee: 0, // FREE for user - platform paid
      gasless: true,
      sponsoredBy: result.sponsorPublicKey,
      message: `Successfully sent $${amount} USDC to ${toAddress} (gas fee paid by platform)`,
    });
  } catch (error) {
    console.error('Error withdrawing USDC:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to withdraw USDC',
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile (username and profile picture)
 */
// Upload profile picture
router.post('/upload-profile-picture', authenticateToken, async (req: Request, res: Response) => {
  try {
    const multer = require('multer');
    const { StorageService } = await import('../services/storage');

    // Configure multer for memory storage
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req: any, file: any, cb: any) => {
        // Only allow images
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'));
        }
      },
    }).single('image');

    // Use multer middleware
    upload(req, res, async (err: any) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          error: err.message || 'File upload failed',
        });
      }

      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const currentUser = (req as any).user;
      const userId = currentUser._id;

      console.log('📤 Processing profile picture:', {
        originalSize: file.size,
        type: file.mimetype,
      });

      // Resize and compress image
      const sharp = require('sharp');
      const processedImage = await sharp(file.buffer)
        .resize(400, 400, {
          fit: 'cover',           // Crop to fill the square
          position: 'center',     // Center the crop
        })
        .jpeg({
          quality: 85,            // Good quality, smaller file size
          progressive: true,      // Progressive JPEG for faster loading
        })
        .toBuffer();

      console.log('✅ Image processed:', {
        originalSize: `${(file.size / 1024).toFixed(2)} KB`,
        processedSize: `${(processedImage.length / 1024).toFixed(2)} KB`,
        reduction: `${(((file.size - processedImage.length) / file.size) * 100).toFixed(1)}%`,
      });

      // Generate unique filename (always .jpg after processing)
      const key = `profile-pictures/${userId}-${Date.now()}.jpg`;

      // Upload to Tigris (returns the key)
      const uploadedKey = await StorageService.uploadFile(
        key,
        processedImage,
        'image/jpeg'
      );

      // Generate a signed URL valid for 7 days
      const signedUrl = await StorageService.getSignedUrl(uploadedKey);

      console.log('✅ Profile picture uploaded successfully');

      res.json({
        success: true,
        key: uploadedKey, // Return the key for database storage
        url: signedUrl,   // Return signed URL for immediate use
      });
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile picture',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { username, profilePicture } = req.body;

    if (!username && !profilePicture) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (username or profilePicture) is required',
      });
    }

    // Refetch user from database to ensure we have the latest data
    const user = await User.findById(currentUser._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Update fields if provided
    if (username !== undefined) {
      const trimmedUsername = username.trim();

      if (trimmedUsername.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Username cannot be empty',
        });
      }

      if (trimmedUsername.length > 50) {
        return res.status(400).json({
          success: false,
          error: 'Username must be 50 characters or less',
        });
      }

      // Check for uppercase letters
      if (trimmedUsername !== trimmedUsername.toLowerCase()) {
        return res.status(400).json({
          success: false,
          error: 'Username must be lowercase only',
        });
      }

      // Validate allowed characters (lowercase letters, numbers, underscores, hyphens)
      const usernameRegex = /^[a-z0-9_-]+$/;
      if (!usernameRegex.test(trimmedUsername)) {
        return res.status(400).json({
          success: false,
          error: 'Username can only contain lowercase letters, numbers, underscores, and hyphens',
        });
      }

      // Check if username is already taken by another user
      const existingUser = await User.findOne({
        username: trimmedUsername.toLowerCase(),
        _id: { $ne: user._id } // Exclude current user
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username is already taken',
        });
      }

      user.username = trimmedUsername.toLowerCase();
    }

    if (profilePicture !== undefined) {
      let pictureToStore = profilePicture.trim();

      // If it's a signed URL, extract the key from it
      if (pictureToStore.includes('profile-pictures/')) {
        // Extract the key from the URL (before any query parameters)
        const match = pictureToStore.match(/profile-pictures\/[^?]+/);
        if (match) {
          pictureToStore = match[0];
        }
      }
      // Otherwise store as-is (emoji or key)

      // Delete old profile picture from storage if it exists and is being replaced
      if (user.profilePicture &&
          user.profilePicture.startsWith('profile-pictures/') &&
          user.profilePicture !== pictureToStore) {
        try {
          const { StorageService } = await import('../services/storage');
          await StorageService.deleteFile(user.profilePicture);
          console.log('🗑️ Deleted old profile picture:', user.profilePicture);
        } catch (error) {
          console.error('Failed to delete old profile picture (non-critical):', error);
          // Don't fail the update if deletion fails
        }
      }

      user.profilePicture = pictureToStore;
    }

    await user.save();

    // Generate signed URL if needed for response
    let profilePictureUrl = user.profilePicture;
    if (profilePictureUrl && profilePictureUrl.startsWith('profile-pictures/')) {
      const { StorageService } = await import('../services/storage');
      profilePictureUrl = await StorageService.getSignedUrl(profilePictureUrl);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: profilePictureUrl,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to update profile',
    });
  }
});

export default router;
