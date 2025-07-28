const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.fileUpload.destination);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

// File filter for audio files only
const fileFilter = (req, file, cb) => {
  if (config.fileUpload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid file type. Allowed types: ${config.fileUpload.allowedTypes.join(
        ', '
      )}`
    );
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.fileUpload.maxSize,
    files: 1, // Only allow one file at a time
  },
  fileFilter: fileFilter,
});

// Middleware for single file upload
const uploadSingle = upload.single('audioFile');

// Error handling wrapper
const handleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'File too large',
          message: `File size must be less than ${
            config.fileUpload.maxSize / 1024 / 1024
          }MB`,
        });
      }

      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          error: 'Invalid file type',
          message: err.message,
        });
      }

      return res.status(400).json({
        error: 'Upload failed',
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select an audio file to upload',
      });
    }

    next();
  });
};

module.exports = {
  handleUpload,
};
