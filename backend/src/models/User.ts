import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username?: string;
  email: string;
  profilePicture?: string;            // URL or emoji for profile picture

  // Authentication
  isEmailVerified: boolean;
  verificationCode?: string;          // Hashed with bcrypt
  verificationCodeExpiry?: Date;      // 10-minute expiry
  verificationAttempts: number;       // Rate limiting (max 3/hour)
  lastVerificationRequest?: Date;

  // Solana Wallet
  publicKey?: string;                 // Base58 public key
  encryptedPrivateKey?: string;       // AES-256-GCM encrypted
  iv?: string;                        // Initialization vector
  authTag?: string;                   // Auth tag for GCM
  walletCreatedAt?: Date;

  // Role
  isAdmin: boolean;

  // Session
  lastLoginAt?: Date;
  refreshTokenVersion: number;        // For token invalidation

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null/undefined values, but enforce uniqueness when set
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      trim: true,
    },

    // Authentication
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpiry: {
      type: Date,
    },
    verificationAttempts: {
      type: Number,
      default: 0,
    },
    lastVerificationRequest: {
      type: Date,
    },

    // Solana Wallet
    publicKey: {
      type: String,
      unique: true,
      sparse: true,  // Allows multiple null values
    },
    encryptedPrivateKey: {
      type: String,
    },
    iv: {
      type: String,
    },
    authTag: {
      type: String,
    },
    walletCreatedAt: {
      type: Date,
    },

    // Role
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // Session
    lastLoginAt: {
      type: Date,
    },
    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for verification code lookup
UserSchema.index({ email: 1, verificationCodeExpiry: 1 });

export default mongoose.model<IUser>('User', UserSchema);












