import { LocalStorageProvider, S3StorageProvider, createStorageProvider } from './storage';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

const s3Config = {
  endpoint: 'https://account.r2.cloudflarestorage.com',
  region: 'auto',
  accessKeyId: 'access-key',
  secretAccessKey: 'secret-key',
  bucket: 'my-bucket',
  publicUrl: 'https://cdn.example.com',
};

describe('S3StorageProvider', () => {
  beforeEach(() => mockSend.mockClear());

  it('save uploads the object and returns an absolute public url', async () => {
    const provider = new S3StorageProvider(s3Config);
    mockSend.mockResolvedValueOnce({});

    const url = await provider.save('user_1.png', Buffer.from('avatar-bytes'), 'image/png');

    expect(url).toBe('https://cdn.example.com/avatars/user_1.png');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('delete removes the object by its key', async () => {
    const provider = new S3StorageProvider(s3Config);
    mockSend.mockResolvedValueOnce({});

    await provider.delete('https://cdn.example.com/avatars/user_1.png');

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('delete is a no-op for an invalid url', async () => {
    const provider = new S3StorageProvider(s3Config);

    await provider.delete('not-a-url');

    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe('createStorageProvider', () => {
  it('returns a local provider by default', () => {
    const provider = createStorageProvider({});
    expect(provider).toBeInstanceOf(LocalStorageProvider);
  });

  it('returns an S3 provider when STORAGE_PROVIDER=s3', () => {
    const provider = createStorageProvider({
      STORAGE_PROVIDER: 's3',
      S3_ENDPOINT: s3Config.endpoint,
      S3_REGION: s3Config.region,
      S3_ACCESS_KEY_ID: s3Config.accessKeyId,
      S3_SECRET_ACCESS_KEY: s3Config.secretAccessKey,
      S3_BUCKET: s3Config.bucket,
      S3_PUBLIC_URL: s3Config.publicUrl,
    });
    expect(provider).toBeInstanceOf(S3StorageProvider);
  });
});
