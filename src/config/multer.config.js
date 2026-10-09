const multer  = require('multer');
const path    = require('path');
const crypto  = require('crypto');
const fs      = require('fs');
const env     = require('./env');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'comprobantes');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = [
  'image/jpeg','image/jpg','image/png','image/webp','application/pdf'
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG, WEBP o PDF.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.UPLOAD_MAX_SIZE_MB * 1024 * 1024 }
});

module.exports = { upload, UPLOAD_DIR };