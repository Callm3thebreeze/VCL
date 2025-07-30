const transcriptionService = require('../services/transcriptionService');
const fileService = require('../services/fileService');
const { validateRequest } = require('../middleware/validation');
const {
  paginationSchema,
  fileIdSchema,
  transcriptionIdSchema,
} = require('../schemas/validationSchemas');

class TranscriptionController {
  /**
   * @swagger
   * /api/transcriptions:
   *   get:
   *     summary: Get user's transcriptions
   *     tags: [Transcriptions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: Transcriptions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 transcriptions:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Transcription'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async getTranscriptions(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const transcriptions = await transcriptionService.getUserTranscriptions(
        req.user.id,
        limit,
        offset
      );

      // Get total count for pagination
      const stats = await transcriptionService.getUserTranscriptionStats(
        req.user.id
      );

      res.json({
        transcriptions: transcriptions.map((transcription) =>
          transcription.toJSON()
        ),
        pagination: {
          page: page,
          limit: limit,
          total: stats.totalTranscriptions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/transcriptions/{id}:
   *   get:
   *     summary: Get specific transcription
   *     tags: [Transcriptions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Transcription ID
   *     responses:
   *       200:
   *         description: Transcription retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Transcription'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Transcription not found
   *       500:
   *         description: Internal server error
   */
  async getTranscription(req, res, next) {
    try {
      const transcriptionId = req.params.id;
      const transcription = await transcriptionService.getTranscriptionById(
        transcriptionId
      );

      if (!transcription || transcription.userId !== req.user.id) {
        return res.status(404).json({
          error: 'Transcription not found',
          message:
            'The requested transcription does not exist or you do not have access to it',
        });
      }

      res.json(transcription.toJSON());
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/transcriptions/file/{fileId}:
   *   get:
   *     summary: Get transcription for specific audio file
   *     tags: [Transcriptions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Audio file ID
   *     responses:
   *       200:
   *         description: Transcription retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Transcription'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Transcription not found
   *       500:
   *         description: Internal server error
   */
  async getTranscriptionByFile(req, res, next) {
    try {
      const fileId = req.params.fileId;

      // Verify user owns the file
      const file = await fileService.getAudioFileByUserAndId(
        req.user.id,
        fileId
      );
      if (!file) {
        return res.status(404).json({
          error: 'File not found',
          message:
            'The requested file does not exist or you do not have access to it',
        });
      }

      const transcription =
        await transcriptionService.getTranscriptionByAudioFile(
          fileId,
          req.user.id
        );

      if (!transcription) {
        return res.status(404).json({
          error: 'Transcription not found',
          message: 'No transcription found for this file',
        });
      }

      res.json(transcription.toJSON());
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/transcriptions/file/{fileId}/retry:
   *   post:
   *     summary: Retry transcription for specific audio file
   *     tags: [Transcriptions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Audio file ID
   *     responses:
   *       200:
   *         description: Transcription retry started successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 transcription:
   *                   $ref: '#/components/schemas/Transcription'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: File or transcription not found
   *       400:
   *         description: Transcription cannot be retried
   *       500:
   *         description: Internal server error
   */
  async retryTranscription(req, res, next) {
    try {
      const fileId = req.params.fileId;

      // Verify user owns the file
      const file = await fileService.getAudioFileByUserAndId(
        req.user.id,
        fileId
      );
      if (!file) {
        return res.status(404).json({
          error: 'File not found',
          message:
            'The requested file does not exist or you do not have access to it',
        });
      }

      const transcription =
        await transcriptionService.getTranscriptionByAudioFile(
          fileId,
          req.user.id
        );

      if (!transcription) {
        return res.status(404).json({
          error: 'Transcription not found',
          message: 'No transcription found for this file',
        });
      }

      // Only allow retry for failed or completed transcriptions
      if (
        transcription.status === 'processing' ||
        transcription.status === 'pending'
      ) {
        return res.status(400).json({
          error: 'Cannot retry transcription',
          message: 'Transcription is already in progress',
        });
      }

      // Reset transcription status to pending
      const updatedTranscription =
        await transcriptionService.updateTranscriptionStatus(
          transcription.id,
          'pending'
        );

      // Start transcription processing (non-blocking)
      transcriptionService
        .processTranscription(transcription.id)
        .catch((error) => {
          console.error('Transcription retry failed:', error);
        });

      res.json({
        message: 'Transcription retry started successfully',
        transcription: updatedTranscription.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/transcriptions/{id}:
   *   delete:
   *     summary: Delete transcription
   *     tags: [Transcriptions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Transcription ID
   *     responses:
   *       200:
   *         description: Transcription deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Transcription not found
   *       500:
   *         description: Internal server error
   */
  async deleteTranscription(req, res, next) {
    try {
      const transcriptionId = req.params.id;
      const deleted = await transcriptionService.deleteTranscription(
        transcriptionId,
        req.user.id
      );

      if (!deleted) {
        return res.status(404).json({
          error: 'Transcription not found',
          message:
            'The requested transcription does not exist or you do not have access to it',
        });
      }

      res.json({
        message: 'Transcription deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/transcriptions/stats:
   *   get:
   *     summary: Get user's transcription statistics
   *     tags: [Transcriptions]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Statistics retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalTranscriptions:
   *                   type: integer
   *                 completedTranscriptions:
   *                   type: integer
   *                 failedTranscriptions:
   *                   type: integer
   *                 pendingTranscriptions:
   *                   type: integer
   *                 processingTranscriptions:
   *                   type: integer
   *                 averageConfidence:
   *                   type: number
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async getTranscriptionStats(req, res, next) {
    try {
      const stats = await transcriptionService.getUserTranscriptionStats(
        req.user.id
      );
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

const transcriptionController = new TranscriptionController();

// Apply validation middleware to methods
transcriptionController.getTranscriptions = [
  validateRequest(paginationSchema, 'query'),
  transcriptionController.getTranscriptions.bind(transcriptionController),
];

transcriptionController.getTranscription = [
  validateRequest(transcriptionIdSchema, 'params'),
  transcriptionController.getTranscription.bind(transcriptionController),
];

transcriptionController.getTranscriptionByFile = [
  validateRequest(fileIdSchema, 'params'),
  transcriptionController.getTranscriptionByFile.bind(transcriptionController),
];

transcriptionController.retryTranscription = [
  validateRequest(fileIdSchema, 'params'),
  transcriptionController.retryTranscription.bind(transcriptionController),
];

transcriptionController.deleteTranscription = [
  validateRequest(transcriptionIdSchema, 'params'),
  transcriptionController.deleteTranscription.bind(transcriptionController),
];

module.exports = transcriptionController;
