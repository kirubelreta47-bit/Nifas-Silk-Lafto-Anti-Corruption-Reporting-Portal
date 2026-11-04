import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { config } from '../config/index.js';

export interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  storageKey: string;
  storageProvider: 'r2' | 'local';
  url: string;
}

const MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/m4a',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
  '.zip': 'application/zip',
};

export const inferMimeType = (filename: string, fallback: string = 'application/octet-stream'): string => {
  const ext = path.extname(filename).toLowerCase();
  return MIME_MAP[ext] || fallback;
};

class StorageService {
  private s3Client: S3Client | null = null;
  private isR2Configured = false;
  private localUploadsDir: string;

  constructor() {
    this.localUploadsDir = path.resolve(config.uploadDir);
    this.init();
  }

  private init() {
    // 1. Ensure local uploads directory exists
    try {
      if (!fs.existsSync(this.localUploadsDir)) {
        fs.mkdirSync(this.localUploadsDir, { recursive: true });
      }
    } catch (err: any) {
      console.error(`❌ [Storage] Failed to create local uploads directory at ${this.localUploadsDir}:`, err.message);
    }

    // 2. Check storage mode
    if (config.storageMode === 'local') {
      console.log(`📁 [Storage] STORAGE_MODE=local active. Upload directory: ${this.localUploadsDir}`);
      console.warn(
        `⚠️ [Storage Notice] Render Ephemeral Filesystem: Uploaded evidence files will NOT persist across service restarts, redeployments, or container sleep on Render's standard filesystem.`
      );
      this.isR2Configured = false;
      return;
    }

    // 3. STORAGE_MODE === 'r2': Configure Cloudflare R2
    const { r2 } = config;
    if (r2.accountId && r2.accessKeyId && r2.secretAccessKey && r2.bucketName) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${r2.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2.accessKeyId,
          secretAccessKey: r2.secretAccessKey,
        },
      });
      this.isR2Configured = true;
      console.log(`☁️ [Storage] Cloudflare R2 configured for bucket: ${r2.bucketName}`);
    } else {
      this.isR2Configured = false;
      if (config.nodeEnv === 'production') {
        console.error(
          '❌ [Storage Error] STORAGE_MODE is set to "r2" in production, but Cloudflare R2 credentials are incomplete. Please set R2 credentials or switch STORAGE_MODE=local.'
        );
      } else {
        console.log(`📁 [Storage] Cloudflare R2 not configured in dev. Using local uploads directory.`);
      }
    }
  }

  public getStatus() {
    return {
      storageMode: config.storageMode,
      provider: config.storageMode === 'local' ? 'Local Filesystem' : 'Cloudflare R2',
      configured: config.storageMode === 'local' ? true : this.isR2Configured,
      uploadDir: config.storageMode === 'local' ? this.localUploadsDir : null,
      bucket: this.isR2Configured ? config.r2.bucketName : null,
      isEphemeral: config.storageMode === 'local',
      persistenceNotice: config.storageMode === 'local'
        ? 'Files stored on local disk can disappear after Render restarts or redeployments.'
        : 'Files stored persistently in Cloudflare R2 object storage.',
    };
  }

  /**
   * Uploads a file buffer to storage (Local filesystem or Cloudflare R2)
   */
  public async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    reportId?: string
  ): Promise<StoredFile> {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const sanitizedFilename = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folderPrefix = reportId ? `evidence/${reportId}` : `evidence/incoming`;
    const storageKey = `${folderPrefix}/${Date.now()}-${fileId}-${sanitizedFilename}`;
    const detectedType = mimeType || inferMimeType(originalName);

    // MODE 1: Explicit Local Filesystem Storage (Presentation deployment / no R2 required)
    if (config.storageMode === 'local' || !this.isR2Configured) {
      if (config.storageMode === 'r2' && config.nodeEnv === 'production') {
        throw new Error(
          'STORAGE_MODE is set to "r2" in production, but Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME) are missing. To skip R2, set STORAGE_MODE=local.'
        );
      }

      // Ensure directory exists
      if (!fs.existsSync(this.localUploadsDir)) {
        fs.mkdirSync(this.localUploadsDir, { recursive: true });
      }

      // Preserve original filename extension on disk
      const localFilename = `${fileId}-${sanitizedFilename}`;
      const localFilePath = path.join(this.localUploadsDir, localFilename);
      fs.writeFileSync(localFilePath, buffer);

      return {
        id: fileId,
        name: originalName,
        type: detectedType,
        size: buffer.length,
        storageKey: localFilename,
        storageProvider: 'local',
        url: `/api/upload/file/${encodeURIComponent(localFilename)}`,
      };
    }

    // MODE 2: Cloudflare R2 Storage (S3-Compatible)
    const command = new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: storageKey,
      Body: buffer,
      ContentType: detectedType,
      ContentDisposition: `attachment; filename="${encodeURIComponent(originalName)}"`,
      Metadata: {
        originalName: encodeURIComponent(originalName),
        fileId,
      },
    });

    await this.s3Client!.send(command);

    const secureUrl = `/api/upload/file/${encodeURIComponent(storageKey)}`;

    return {
      id: fileId,
      name: originalName,
      type: detectedType,
      size: buffer.length,
      storageKey,
      storageProvider: 'r2',
      url: secureUrl,
    };
  }

  /**
   * Retrieves an authorized read stream for a stored file
   */
  public async getFileStream(storageKey: string): Promise<{
    stream: Readable;
    contentType: string;
    contentLength: number;
    filename: string;
  }> {
    const rawKey = decodeURIComponent(storageKey);
    const baseFilename = path.basename(rawKey);

    // 1. Check local uploads directory first
    const localFilePath = path.join(this.localUploadsDir, baseFilename);
    if (fs.existsSync(localFilePath)) {
      const stat = fs.statSync(localFilePath);
      const stream = fs.createReadStream(localFilePath);
      const contentType = inferMimeType(baseFilename);

      return {
        stream,
        contentType,
        contentLength: stat.size,
        filename: baseFilename,
      };
    }

    // 2. If R2 is configured, stream from Cloudflare R2
    if (this.isR2Configured && this.s3Client) {
      try {
        const command = new GetObjectCommand({
          Bucket: config.r2.bucketName,
          Key: rawKey,
        });

        const response = await this.s3Client.send(command);
        const stream = response.Body as Readable;
        const contentType = response.ContentType || inferMimeType(baseFilename);
        const contentLength = response.ContentLength || 0;

        return {
          stream,
          contentType,
          contentLength,
          filename: baseFilename,
        };
      } catch (err: any) {
        console.error(`S3/R2 read failed for key ${rawKey}:`, err.message);
      }
    }

    throw new Error(`File not found on storage: ${storageKey}`);
  }

  /**
   * Generates a temporary signed download URL for direct browser access if needed
   */
  public async getPresignedDownloadUrl(storageKey: string, expiresInSeconds: number = 3600): Promise<string> {
    if (!this.isR2Configured || !this.s3Client) {
      return `/api/upload/file/${encodeURIComponent(storageKey)}`;
    }

    const command = new GetObjectCommand({
      Bucket: config.r2.bucketName,
      Key: storageKey,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
  }
}

export const storageService = new StorageService();
