import fs from 'node:fs';
import path from 'node:path';
import { LocalStorageProvider } from './storage';

describe('LocalStorageProvider', () => {
  const provider = new LocalStorageProvider();
  const dir = path.resolve(process.cwd(), 'uploads/avatars');
  const name = `jest-${process.pid}-${Date.now()}.png`;
  const publicUrl = `/uploads/avatars/${name}`;

  afterAll(async () => {
    await fs.promises.rm(path.join(dir, name), { force: true });
  });

  it('save writes the buffer and returns the public url', async () => {
    const returned = await provider.save(name, Buffer.from('avatar-bytes'), 'image/png');
    expect(returned).toBe(publicUrl);
    expect(await fs.promises.readFile(path.join(dir, name), 'utf8')).toBe('avatar-bytes');
  });

  it('delete removes an existing file', async () => {
    await provider.save(name, Buffer.from('x'), 'image/png');
    await provider.delete(publicUrl);
    expect(fs.existsSync(path.join(dir, name))).toBe(false);
  });

  it('delete is a no-op when the file is missing', async () => {
    await expect(
      provider.delete('/uploads/avatars/definitely-missing.png'),
    ).resolves.toBeUndefined();
  });
});
