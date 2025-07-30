const express = require('express');
const TranscriptionController = require('../controllers/transcriptionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const transcriptionController = new TranscriptionController();

// All transcription routes require authentication
router.use(authenticateToken);

// Upload and transcribe audio file
router.post(
  '/upload',
  transcriptionController.getUploadMiddleware(),
  transcriptionController.uploadAndTranscribe.bind(transcriptionController)
);

// Get transcriptions
router.get(
  '/',
  transcriptionController.getTranscriptions.bind(transcriptionController)
);

// Get specific transcription
router.get(
  '/:id',
  transcriptionController.getTranscription.bind(transcriptionController)
);

// Delete transcription
router.delete(
  '/:id',
  transcriptionController.deleteTranscription.bind(transcriptionController)
);

module.exports = router;
