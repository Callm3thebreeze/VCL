const TranscriptionService = require('../services/transcriptionService');
const FileService = require('../services/fileService');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const config = require('../config/config');

class TranscriptionController {
  constructor() {
    this.transcriptionService = new TranscriptionService();
    this.fileService = new FileService();

    // Configurar multer para uploads temporales
    this.upload = multer({
      dest: path.join(config.upload.uploadDir, 'temp'),
      limits: {
        fileSize: config.upload.maxFileSize,
      },
      fileFilter: (req, file, cb) => {
        if (this.fileService.isValidAudioFile(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `Invalid file type. Allowed types: ${config.upload.allowedTypes.join(
                ', '
              )}`
            )
          );
        }
      },
    });
  }

  /**
   * @swagger
   * /api/transcriptions/upload:
   *   post:
   *     summary: Upload audio file and start transcription
   *     tags: [Transcriptions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               audio:
   *                 type: string
   *                 format: binary
   *               language:
   *                 type: string
   *                 default: es
   *     responses:
   *       200:
   *         description: Upload successful, transcription started
   *       400:
   *         description: Invalid file or request
   *       401:
   *         description: Unauthorized
   */
  async uploadAndTranscribe(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No audio file uploaded',
        });
      }

      const { language = 'es' } = req.body;
      const userId = req.user.id;

      console.log(
        `📤 Usuario ${userId} subiendo archivo: ${req.file.originalname}`
      );

      // Guardar archivo permanentemente
      const fileData = await this.fileService.saveToLocal(
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        userId
      );

      // Crear registro de archivo de audio
      const audioFile = await this.fileService.createAudioFile(
        {
          originalFilename: req.file.originalname,
          storedFilename: fileData.storedFilename,
          filePath: fileData.filePath,
          fileSize: fileData.fileSize,
          mimeType: req.file.mimetype,
        },
        userId
      );

      // Crear registro de transcripción
      const transcription = await this.transcriptionService.createTranscription(
        audioFile.id,
        userId
      );

      // Procesar transcripción de forma asíncrona
      this.processTranscriptionAsync(transcription.id, language);

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully. Transcription started.',
        data: {
          transcriptionId: transcription.id,
          audioFileId: audioFile.id,
          status: 'pending',
          fileName: req.file.originalname,
        },
      });
    } catch (error) {
      // Limpiar archivo temporal si existe
      if (req.file?.path) {
        await fs.remove(req.file.path).catch(() => {});
      }

      console.error('Upload error:', error);
      next(error);
    }
  }

  /**
   * Process transcription asynchronously
   */
  async processTranscriptionAsync(transcriptionId, _language = 'es') {
    try {
      await this.transcriptionService.processTranscription(transcriptionId);
    } catch (error) {
      console.error(
        `Background transcription failed for ${transcriptionId}:`,
        error
      );
    }
  }

  /**
   * @swagger
   * /api/transcriptions:
   *   get:
   *     summary: Get user transcriptions
   *     tags: [Transcriptions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, processing, completed, failed]
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *     responses:
   *       200:
   *         description: List of transcriptions
   */
  async getTranscriptions(req, res, next) {
    try {
      const userId = req.user.id;
      const { status, limit = 50, offset = 0 } = req.query;

      const transcriptions =
        await this.transcriptionService.getUserTranscriptions(userId, {
          status,
          limit: parseInt(limit),
          offset: parseInt(offset),
        });

      res.json({
        success: true,
        data: transcriptions,
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
   *     responses:
   *       200:
   *         description: Transcription details
   *       404:
   *         description: Transcription not found
   */
  async getTranscription(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const transcription =
        await this.transcriptionService.getTranscriptionWithAudioFile(
          parseInt(id),
          userId
        );

      if (!transcription) {
        return res.status(404).json({
          success: false,
          error: 'Transcription not found',
        });
      }

      res.json({
        success: true,
        data: transcription,
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
   *     responses:
   *       200:
   *         description: Transcription deleted successfully
   *       404:
   *         description: Transcription not found
   */
  async deleteTranscription(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Obtener información de la transcripción antes de eliminar
      const transcription =
        await this.transcriptionService.getTranscriptionWithAudioFile(
          parseInt(id),
          userId
        );

      if (!transcription) {
        return res.status(404).json({
          success: false,
          error: 'Transcription not found',
        });
      }

      // Eliminar transcripción
      await this.transcriptionService.deleteTranscription(parseInt(id), userId);

      // Eliminar archivo de audio si no tiene otras transcripciones
      if (transcription.audioFile) {
        await this.fileService.deleteAudioFile(
          transcription.audioFile.id,
          userId
        );
      }

      res.json({
        success: true,
        message: 'Transcription deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get upload middleware for multer
   */
  getUploadMiddleware() {
    return this.upload.single('audio');
  }
}

module.exports = TranscriptionController;
