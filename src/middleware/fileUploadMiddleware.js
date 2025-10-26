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
    // Example: employer_23_20251026_163031.xlsx
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const uniqueName = `${baseName}_${req.user?.id || 'anonymous'}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter for Excel + CSV files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
    'application/csv', // some browsers send this
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.xls', '.xlsx', '.csv'];

  if (!allowedTypes.includes(file.mimetype) && !allowedExts.includes(ext)) {
    return cb(new Error('Only Excel (.xls, .xlsx) or CSV (.csv) files are allowed!'), false);
  }
  cb(null, true);
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

export default upload;
