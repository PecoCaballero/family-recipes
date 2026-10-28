import fs from 'node:fs';
import path from 'node:path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface StorageProvider {
  save(filename: string, buffer: Buffer, mimetype: string): Promise<string>;
  delete(url: string): Promise<void>;
}

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads/avatars');

export class LocalStorageProvider implements StorageProvider {
  async save(filename: string, buffer: Buffer, _mimetype: string): Promise<string> {
    await fs.promises.mkdir(UPLOADS_DIR, { recursive: true });
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/avatars/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const filename = url.split('/').pop();
    if (!filename) return;
    const filePath = path.join(UPLOADS_DIR, filename);
    try {
      await fs.promises.unlink(filePath);
    } catch {
      // file already gone — ok
    }
  }
}

const AVATARS_PREFIX = 'avatars';

export interface S3Config {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}

export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly publicPath: string;

  constructor(config: S3Config) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      // R2 and other S3-compatible stores use path-style addressing.
      forcePathStyle: true,
    });
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl.replace(/\/+$/, '');
    this.publicPath = safePathname(this.publicUrl);
  }

  async save(filename: string, buffer: Buffer, mimetype: string): Promise<string> {
    const key = `${AVATARS_PREFIX}/${filename}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }),
    );
    return `${this.publicUrl}/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = this.keyFromUrl(url);
    if (!key) return;
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch {
      // object already gone — ok
    }
  }

  private keyFromUrl(url: string): string | null {
    let pathname: string;
    try {
      pathname = new URL(url).pathname;
    } catch {
      return null;
    }
    if (this.publicPath && pathname.startsWith(this.publicPath)) {
      pathname = pathname.slice(this.publicPath.length);
    }
    const key = pathname.replace(/^\/+/, '');
    return key || null;
  }
}

function safePathname(url: string): string {
  try {
    return new URL(url).pathname.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

export function createStorageProvider(
  env: Record<string, string | undefined> = process.env,
): StorageProvider {
  if (env.STORAGE_PROVIDER === 's3') {
    return new S3StorageProvider({
      endpoint: env.S3_ENDPOINT!,
      region: env.S3_REGION ?? 'auto',
      accessKeyId: env.S3_ACCESS_KEY_ID!,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      bucket: env.S3_BUCKET!,
      publicUrl: env.S3_PUBLIC_URL!,
    });
  }
  return new LocalStorageProvider();
}
