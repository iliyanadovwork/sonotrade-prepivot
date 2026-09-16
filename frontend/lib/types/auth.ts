export interface User {
  _id: string;
  username?: string;
  email: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  isKycVerified?: boolean;
  kycVerifiedAt?: string;
  kycCheckedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  sol: number;
  usdc: number;
}

export interface Wallet {
  publicKey: string;
  walletCreatedAt?: string;
  balance?: WalletBalance;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
  wallet?: Wallet;
}

export interface SendCodeResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  success: boolean;
  token: string;
}

export interface MeResponse {
  success: boolean;
  user: User;
  wallet?: Wallet;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface BalanceResponse {
  success: boolean;
  balance: WalletBalance;
}

export interface USDCAddressResponse {
  success: boolean;
  usdcAddress: string;
  publicKey: string;
}

export interface WithdrawalResponse {
  success: boolean;
  signature: string;
  fee: number;
  message: string;
}
