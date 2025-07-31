const express = require('express');
const FileController = require('../controllers/fileController');
const { authenticateToken } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');

const router = express.Router();
const fileController = new FileController();

// All file routes require authentication
router.use(authenticateToken);

router.post(
  '/upload',
  handleUpload,
  fileController.uploadFile.bind(fileController)
);
router.get('/', fileController.getFiles.bind(fileController));
router.get('/stats', fileController.getFileStats.bind(fileController));
router.get('/:id', fileController.getFile.bind(fileController));
router.get('/:id/download', fileController.getDownloadUrl.bind(fileController));
router.delete('/:id', fileController.deleteFile.bind(fileController));

module.exports = router;
