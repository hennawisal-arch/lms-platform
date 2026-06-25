const multer = require('multer');
const path = require('path');
const fs = require('fs');

const videoDir = path.join(__dirname, '..', 'uploads', 'videos');
const thumbDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
[videoDir, thumbDir].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') return cb(null, videoDir);
    if (file.fieldname === 'thumbnail') return cb(null, thumbDir);
    cb(new Error('Unexpected field'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video') {
    if (!file.mimetype.startsWith('video/')) return cb(new Error('Only video files are allowed for the video field'));
  }
  if (file.fieldname === 'thumbnail') {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed for the thumbnail field'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max per file
});

module.exports = upload;
