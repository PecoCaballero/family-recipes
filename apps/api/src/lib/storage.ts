import fs from 'node:fs';
import path from 'node:path';

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
