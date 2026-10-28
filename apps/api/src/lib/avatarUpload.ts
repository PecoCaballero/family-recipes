import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are accepted'));
      return;
    }
    cb(null, true);
  },
});

export const avatarUploadMiddleware = upload.single('avatar');

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * Maps a validated `image/*` MIME type to a safe extension. Never derives the
 * extension from client-supplied filenames (path traversal risk).
 */
export function extensionForMimeType(mimetype: string): string {
  return MIME_TO_EXT[mimetype] ?? 'png';
}
