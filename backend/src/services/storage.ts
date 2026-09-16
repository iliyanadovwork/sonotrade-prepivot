import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  endpoint: process.env.TIGRIS_ENDPOINT,
  region: process.env.TIGRIS_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.TIGRIS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.TIGRIS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.TIGRIS_BUCKET_NAME!;

export class StorageService {
  // Upload file and return the key (not the URL)
  static async uploadFile(
    key: string,
    body: Buffer,
    contentType: string
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
    });

    await s3Client.send(command);

    console.log('✅ File uploaded to Tigris:', key);
    return key; // Return just the key
  }

  // Generate a signed URL for a key
  // Default: 365 days for profile pictures (max allowed by S3 is 7 days, but we can refresh)
  // For profile pictures, use longer expiration since they're public content
  static async getSignedUrl(key: string, expiresIn: number = 7 * 24 * 60 * 60): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    // S3 max is 7 days (604800 seconds), so we cap it there
    const maxExpiry = 7 * 24 * 60 * 60;
    const actualExpiry = Math.min(expiresIn, maxExpiry);

    const url = await getSignedUrl(s3Client, command, { expiresIn: actualExpiry });
    console.log('🔗 Generated signed URL for:', key, 'expires in', actualExpiry, 'seconds');
    return url;
  }

  // Delete file
  static async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  }
}
