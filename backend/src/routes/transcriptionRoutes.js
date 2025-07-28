const express = require('express');
const transcriptionController = require('../controllers/transcriptionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All transcription routes require authentication
router.use(authenticateToken);

router.get('/', transcriptionController.getTranscriptions);
router.get('/stats', transcriptionController.getTranscriptionStats);
router.get('/:id', transcriptionController.getTranscription);
router.get('/file/:fileId', transcriptionController.getTranscriptionByFile);
router.post('/file/:fileId/retry', transcriptionController.retryTranscription);
router.delete('/:id', transcriptionController.deleteTranscription);

module.exports = router;
