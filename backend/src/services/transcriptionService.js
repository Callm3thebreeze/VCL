const database = require('../config/database');
const Transcription = require('../models/Transcription');
const AudioFile = require('../models/AudioFile');
const WhisperService = require('./whisperService');
const S3Service = require('./s3Service');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TranscriptionService {
  constructor() {
    this.whisperService = new WhisperService();
    this.s3Service = new S3Service();
  }

  /**
   * Create a new transcription record
   */
  async createTranscription(audioFileId, userId) {
    const { data, error } = await database.client
      .from('transcriptions')
      .insert([
        {
          audio_file_id: audioFileId,
          user_id: userId,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating transcription: ${error.message}`);
    }

    return Transcription.fromDatabase(data);
  }

  /**
   * Process transcription asynchronously
   */
  async processTranscription(transcriptionId) {
    try {
      console.log(
        `🚀 Iniciando procesamiento de transcripción ${transcriptionId}`
      );

      // Marcar como en procesamiento
      await this.updateTranscriptionStatus(transcriptionId, 'processing', {
        processing_started_at: new Date().toISOString(),
      });

      // Obtener datos de transcripción y archivo
      const transcription = await this.getTranscriptionById(transcriptionId);
      if (!transcription) {
        throw new Error('Transcription not found');
      }

      const audioFile = await this.getAudioFileById(transcription.audioFileId);
      if (!audioFile) {
        throw new Error('Audio file not found');
      }

      // Validar datos críticos del archivo
      if (audioFile.storageType === 's3') {
        if (!audioFile.s3Key || !audioFile.s3Bucket) {
          throw new Error('Missing S3 metadata for audio file');
        }
      } else {
        if (!audioFile.filePath) {
          throw new Error('Missing file path for local audio file');
        }
      }

      // Debug: Mostrar datos del archivo
      console.log('📊 AudioFile data:', {
        id: audioFile.id,
        originalFilename: audioFile.originalFilename,
        storageType: audioFile.storageType,
        s3Key: audioFile.s3Key,
        s3Bucket: audioFile.s3Bucket,
        filePath: audioFile.filePath,
      });

      let localFilePath;
      let shouldCleanupTempFile = false;

      // Determinar si el archivo está en S3 o local
      if (audioFile.storageType === 's3' && audioFile.s3Key) {
        console.log(`📥 Descargando archivo de S3: ${audioFile.s3Key}`);

        // Crear archivo temporal para Whisper
        const tempDir = path.join(__dirname, '../../temp');
        await fs.ensureDir(tempDir);

        const tempFileName = `temp-${uuidv4()}${path.extname(
          audioFile.originalFilename
        )}`;
        localFilePath = path.join(tempDir, tempFileName);

        // Generar URL temporal de S3 para descargar
        const signedUrl = await this.s3Service.getSignedUrl(
          audioFile.s3Key,
          3600
        );

        // Descargar archivo de S3 a archivo temporal
        const https = require('https');
        await new Promise((resolve, reject) => {
          const file = fs.createWriteStream(localFilePath);

          https
            .get(signedUrl, (response) => {
              // Verificar código de respuesta HTTP
              if (response.statusCode !== 200) {
                reject(
                  new Error(
                    `Failed to download from S3: HTTP ${response.statusCode}`
                  )
                );
                return;
              }

              response.pipe(file);

              file.on('finish', () => {
                file.close();
                resolve();
              });

              file.on('error', (err) => {
                fs.remove(localFilePath).catch(() => {}); // Limpiar archivo parcial
                reject(err);
              });
            })
            .on('error', (err) => {
              fs.remove(localFilePath).catch(() => {}); // Limpiar archivo parcial
              reject(err);
            });
        });

        shouldCleanupTempFile = true;
        console.log(`✅ Archivo descargado temporalmente: ${localFilePath}`);

        // Verificar que el archivo se descargó correctamente
        if (!(await fs.pathExists(localFilePath))) {
          throw new Error(
            'Failed to download file from S3 - file not found after download'
          );
        }

        const fileStats = await fs.stat(localFilePath);
        if (fileStats.size === 0) {
          throw new Error('Downloaded file from S3 is empty');
        }

        console.log(`📁 Archivo descargado - Tamaño: ${fileStats.size} bytes`);
      } else {
        // Archivo local
        localFilePath = audioFile.filePath;

        // Verificar que el archivo existe
        if (!(await fs.pathExists(localFilePath))) {
          throw new Error(`Audio file not found at path: ${localFilePath}`);
        }
      }

      try {
        // Procesar con Whisper usando el archivo local/temporal
        const result = await this.whisperService.transcribeAudio(
          localFilePath,
          {
            language: transcription.language,
          }
        );

        // Actualizar transcripción con resultado
        await this.updateTranscriptionStatus(transcriptionId, 'completed', {
          transcription_text: result.text,
          confidence_score: result.confidence,
          processing_completed_at: new Date().toISOString(),
        });

        console.log(
          `✅ Transcripción ${transcriptionId} completada exitosamente`
        );
        return result;
      } finally {
        // Limpiar archivo temporal si se creó
        if (shouldCleanupTempFile && localFilePath) {
          try {
            await fs.remove(localFilePath);
            console.log(`🧹 Archivo temporal eliminado: ${localFilePath}`);
          } catch (cleanupError) {
            console.error('Error limpiando archivo temporal:', cleanupError);
          }
        }
      }
    } catch (error) {
      console.error(
        `❌ Error procesando transcripción ${transcriptionId}:`,
        error
      );

      // Marcar como fallida
      await this.updateTranscriptionStatus(transcriptionId, 'failed', {
        error_message: error.message,
        processing_completed_at: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Update transcription status and data
   */
  async updateTranscriptionStatus(
    transcriptionId,
    status,
    additionalData = {}
  ) {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...additionalData,
    };

    const { error } = await database.client
      .from('transcriptions')
      .update(updateData)
      .eq('id', transcriptionId);

    if (error) {
      throw new Error(`Error updating transcription: ${error.message}`);
    }
  }

  /**
   * Get transcription by ID
   */
  async getTranscriptionById(id) {
    const { data, error } = await database.client
      .from('transcriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return Transcription.fromDatabase(data);
  }

  /**
   * Get audio file by ID
   */
  async getAudioFileById(id) {
    const { data, error } = await database.client
      .from('audio_files')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return AudioFile.fromDatabase(data);
  }

  /**
   * Get user transcriptions
   */
  async getUserTranscriptions(userId, options = {}) {
    const { limit = 50, offset = 0, status } = options;

    let query = database.client
      .from('transcriptions')
      .select(
        `
        *,
        audio_files (
          original_filename,
          file_size,
          duration_seconds
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching transcriptions: ${error.message}`);
    }

    return data.map((item) => ({
      ...Transcription.fromDatabase(item).toJSON(),
      audioFile: item.audio_files
        ? AudioFile.fromDatabase(item.audio_files).toJSON()
        : null,
    }));
  }

  /**
   * Delete transcription
   */
  async deleteTranscription(transcriptionId, userId) {
    const { error } = await database.client
      .from('transcriptions')
      .delete()
      .eq('id', transcriptionId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error deleting transcription: ${error.message}`);
    }
  }

  /**
   * Get transcription with audio file details
   */
  async getTranscriptionWithAudioFile(transcriptionId, userId) {
    const { data, error } = await database.client
      .from('transcriptions')
      .select(
        `
        *,
        audio_files (*)
      `
      )
      .eq('id', transcriptionId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      ...Transcription.fromDatabase(data).toJSON(),
      audioFile: data.audio_files
        ? AudioFile.fromDatabase(data.audio_files).toJSON()
        : null,
    };
  }
}

module.exports = TranscriptionService;
