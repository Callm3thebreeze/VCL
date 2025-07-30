const OpenAI = require('openai');
const fs = require('fs-extra');
const config = require('../config/config');

class WhisperService {
  constructor() {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is required for Whisper service');
    }

    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Transcribe audio file using OpenAI Whisper
   * @param {string} audioFilePath - Path to the audio file
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeAudio(audioFilePath, options = {}) {
    try {
      console.log(`🎤 Iniciando transcripción de: ${audioFilePath}`);

      // Verificar que el archivo existe
      if (!(await fs.pathExists(audioFilePath))) {
        throw new Error(`Audio file not found: ${audioFilePath}`);
      }

      // Obtener información del archivo
      const fileStats = await fs.stat(audioFilePath);
      console.log(`📁 Tamaño del archivo: ${fileStats.size} bytes`);

      // Verificar límite de tamaño (25MB para Whisper API)
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (fileStats.size > maxSize) {
        throw new Error('File size exceeds OpenAI Whisper limit (25MB)');
      }

      // Crear stream del archivo
      const audioStream = fs.createReadStream(audioFilePath);

      // Configurar parámetros de transcripción
      const transcriptionParams = {
        file: audioStream,
        model: config.openai.whisperModel,
        language: options.language || config.openai.whisperLanguage,
        response_format: 'verbose_json', // Incluye timestamps y metadata
        timestamp_granularities: ['word'], // Timestamps por palabra
      };

      console.log(`🚀 Enviando a OpenAI Whisper...`);
      const startTime = Date.now();

      // Llamar a la API de Whisper
      const transcription = await this.openai.audio.transcriptions.create(
        transcriptionParams
      );

      const processingTime = Date.now() - startTime;
      console.log(`✅ Transcripción completada en ${processingTime}ms`);

      // Procesar resultado
      const result = {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        words: transcription.words || [],
        segments: transcription.segments || [],
        processingTimeMs: processingTime,
        confidence: this.calculateAverageConfidence(transcription.words || []),
      };

      console.log(`📝 Texto transcrito: ${result.text.substring(0, 100)}...`);
      return result;
    } catch (error) {
      console.error('❌ Error en transcripción:', error);
      throw new Error(`Whisper transcription failed: ${error.message}`);
    }
  }

  /**
   * Calculate average confidence score from word-level timestamps
   * @param {Array} words - Array of word objects with confidence scores
   * @returns {number} Average confidence (0-1)
   */
  calculateAverageConfidence(words) {
    if (!words || words.length === 0) return 0;

    const confidenceSum = words.reduce((sum, word) => {
      return sum + (word.confidence || 0);
    }, 0);

    return confidenceSum / words.length;
  }

  /**
   * Get supported audio formats
   * @returns {Array} Array of supported MIME types
   */
  getSupportedFormats() {
    return [
      'audio/mpeg', // mp3
      'audio/wav', // wav
      'audio/mp4', // mp4, m4a
      'audio/aac', // aac
      'audio/ogg', // ogg
      'audio/webm', // webm
      'audio/flac', // flac
    ];
  }

  /**
   * Validate audio file format
   * @param {string} mimeType - MIME type of the file
   * @returns {boolean} True if format is supported
   */
  isFormatSupported(mimeType) {
    return this.getSupportedFormats().includes(mimeType);
  }

  /**
   * Estimate transcription cost (approximate)
   * @param {number} durationMinutes - Audio duration in minutes
   * @returns {number} Estimated cost in USD
   */
  estimateCost(durationMinutes) {
    // OpenAI Whisper pricing: $0.006 per minute
    const pricePerMinute = 0.006;
    return durationMinutes * pricePerMinute;
  }
}

module.exports = WhisperService;
