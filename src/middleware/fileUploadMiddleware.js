import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const uniqueName = `${baseName}_${req.user?.id || 'anonymous'}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// Supported MIME types
const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/jpg',
  // PDFs
  'application/pdf',
  // Excel files
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // CSV
  'text/csv',
  'application/csv',
  // Word documents
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Plain text
  'text/plain',
  // ZIP / RAR archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
];

// Supported extensions (fallback)
const allowedExts = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.pdf',
  '.xls',
  '.xlsx',
  '.csv',
  '.doc',
  '.docx',
  '.txt',
  '.zip',
  '.rar',
];

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype) && !allowedExts.includes(ext)) {
    return cb(new Error('Invalid file type! Allowed: Images, PDFs, Excel, CSV, Docs, Text, ZIP/RAR.'), false);
  }
  cb(null, true);
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

export default upload;
