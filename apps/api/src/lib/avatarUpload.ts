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
