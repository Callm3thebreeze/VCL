const express = require('express');
const fileController = require('../controllers/fileController');
const { authenticateToken } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');

const router = express.Router();

// All file routes require authentication
router.use(authenticateToken);

router.post('/upload', handleUpload, fileController.uploadFile);
router.get('/', fileController.getFiles);
router.get('/stats', fileController.getFileStats);
router.get('/:id', fileController.getFile);
router.get('/:id/download', fileController.getDownloadUrl);
router.delete('/:id', fileController.deleteFile);

module.exports = router;
