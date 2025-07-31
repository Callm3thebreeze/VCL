const FileService = require('../services/fileService');
const TranscriptionService = require('../services/transcriptionService');
const { validateRequest } = require('../middleware/validation');
const {
  paginationSchema,
  fileIdSchema,
} = require('../schemas/validationSchemas');

class FileController {
  constructor() {
    this.fileService = new FileService();
    this.transcriptionService = new TranscriptionService();
  }

  /**
   * @swagger
   * /api/files/upload:
   *   post:
   *     summary: Upload an audio file
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               audioFile:
   *                 type: string
   *                 format: binary
   *                 description: Audio file to upload (max 20MB)
   *     responses:
   *       201:
   *         description: File uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 file:
   *                   $ref: '#/components/schemas/AudioFile'
   *                 transcription:
   *                   $ref: '#/components/schemas/Transcription'
   *       400:
   *         description: File validation error
   *       401:
   *         description: Unauthorized
   *       413:
   *         description: File too large
   *       500:
   *         description: Internal server error
   */
  async uploadFile(req, res, next) {
    try {
      // Process file upload to S3 and create database record
      const audioFile = await this.this.fileService.processFileUpload(
        req.user.id,
        req.file
      );

      // Create transcription record
      const transcription = await this.transcriptionService.createTranscription(
        audioFile.id,
        req.user.id
      );

      // Start transcription processing (non-blocking)
      this.transcriptionService
        .processTranscription(transcription.id)
        .catch((error) => {
          console.error('Transcription processing failed:', error);
        });

      res.status(201).json({
        message: 'File uploaded successfully',
        file: audioFile.toJSON(),
        transcription: transcription.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/files:
   *   get:
   *     summary: Get user's audio files
   *     tags: [Files]
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
   *         description: Files retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 files:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AudioFile'
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
  async getFiles(req, res, next) {
    try {
      const { page, limit } = req.query;
      const offset = (page - 1) * limit;

      const files = await this.this.fileService.getUserAudioFiles(
        req.user.id,
        limit,
        offset
      );

      // Get total count for pagination
      const stats = await this.this.fileService.getUserFileStats(req.user.id);

      res.json({
        files: files.map((file) => file.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: stats.totalFiles,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/files/{id}:
   *   get:
   *     summary: Get specific audio file
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: File ID
   *     responses:
   *       200:
   *         description: File retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AudioFile'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: File not found
   *       500:
   *         description: Internal server error
   */
  async getFile(req, res, next) {
    try {
      const fileId = req.params.id;
      const file = await this.this.fileService.getAudioFileByUserAndId(
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

      res.json(file.toJSON());
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/files/{id}/download:
   *   get:
   *     summary: Get download URL for audio file
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: File ID
   *     responses:
   *       200:
   *         description: Download URL generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 downloadUrl:
   *                   type: string
   *                 expiresAt:
   *                   type: string
   *                   format: date-time
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: File not found
   *       500:
   *         description: Internal server error
   */
  async getDownloadUrl(req, res, next) {
    try {
      const fileId = req.params.id;
      const file = await this.fileService.getAudioFileByUserAndId(
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

      // Generate presigned URL for download (valid for 1 hour)
      const downloadUrl = await this.fileService.generatePresignedUrl(
        file.s3Key,
        3600
      );
      const expiresAt = new Date(Date.now() + 3600 * 1000);

      res.json({
        downloadUrl,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/files/{id}:
   *   delete:
   *     summary: Delete audio file
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: File ID
   *     responses:
   *       200:
   *         description: File deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: File not found
   *       500:
   *         description: Internal server error
   */
  async deleteFile(req, res, next) {
    try {
      const fileId = req.params.id;
      const deleted = await this.fileService.deleteAudioFile(
        req.user.id,
        fileId
      );

      if (!deleted) {
        return res.status(404).json({
          error: 'File not found',
          message:
            'The requested file does not exist or you do not have access to it',
        });
      }

      res.json({
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/files/stats:
   *   get:
   *     summary: Get user's file statistics
   *     tags: [Files]
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
   *                 totalFiles:
   *                   type: integer
   *                 totalSize:
   *                   type: integer
   *                 averageSize:
   *                   type: number
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async getFileStats(req, res, next) {
    try {
      const stats = await this.fileService.getUserFileStats(req.user.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FileController;
