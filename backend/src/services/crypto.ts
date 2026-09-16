import crypto from 'crypto';
import bcrypt from 'bcrypt';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
const BCRYPT_ROUNDS = 12;

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts private key bytes using AES-256-GCM
 */
export function encryptPrivateKey(privateKeyBytes: Uint8Array): EncryptedData {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(privateKeyBytes)),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypts private key using AES-256-GCM
 */
export function decryptPrivateKey(
  encrypted: string,
  iv: string,
  authTag: string
): Uint8Array {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    ENCRYPTION_KEY,
    Buffer.from(iv, 'base64')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final(),
  ]);

  return new Uint8Array(decrypted);
}

/**
 * Hashes verification code using bcrypt
 */
export async function hashVerificationCode(code: string): Promise<string> {
  return bcrypt.hash(code, BCRYPT_ROUNDS);
}

/**
 * Compares verification code with hash
 */
export async function compareVerificationCode(
  code: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

/**
 * Generates a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}
