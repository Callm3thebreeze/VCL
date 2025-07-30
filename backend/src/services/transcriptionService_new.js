const database = require('../config/database');
const Transcription = require('../models/Transcription');
const AudioFile = require('../models/AudioFile');
const WhisperService = require('./whisperService');
const fs = require('fs-extra');

class TranscriptionService {
  constructor() {
    this.whisperService = new WhisperService();
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

      // Verificar que el archivo existe
      if (!(await fs.pathExists(audioFile.filePath))) {
        throw new Error(`Audio file not found at path: ${audioFile.filePath}`);
      }

      // Procesar con Whisper
      const result = await this.whisperService.transcribeAudio(
        audioFile.filePath,
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
